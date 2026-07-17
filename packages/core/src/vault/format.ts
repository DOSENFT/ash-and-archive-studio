// SPEC-001 §9.1 — the export file formats: deterministic ordering, UTF-8, LF.
// One module owns both the emitters and the parsers so export and import are
// structural inverses (§9.2 lossless round-trip is a property of THIS file).
// The frontmatter dialect is deliberately small: scalar keys at column 0, complex
// values as JSON flow (JSON is valid YAML), lists as `  - {json}` items — legal
// YAML that Obsidian reads, hand-rolled here because §17 caps the dependency set
// (SQLite, Zod, a ULID generator — nothing else earns a package).

/** Filesystem-safe slug for <slug>-<id> file names (§9.1). Deterministic:
 *  lowercase, diacritics stripped, runs of non [a-z0-9] collapsed to '-'. */
export function slug(name: string): string {
  const s = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return s.length > 0 ? s : "untitled";
}

const BARE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const RESERVED = new Set(["null", "true", "false", "yes", "no", "on", "off"]);

/** One frontmatter scalar. Bare only when unambiguous; otherwise JSON (valid YAML). */
export function yamlScalar(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return JSON.stringify(v);
  if (typeof v === "string") {
    if (BARE.test(v) && !RESERVED.has(v.toLowerCase()) && !/^[0-9.+-]+$/.test(v)) return v;
    return JSON.stringify(v);
  }
  return JSON.stringify(v); // objects/arrays as JSON flow
}

export interface FrontmatterDoc {
  fm: Record<string, unknown>;
  /** prose sections after the frontmatter: `## key` → trimmed markdown text */
  sections: Record<string, string>;
}

/** Emit a frontmatter block from ordered [key, value] pairs; values may be
 *  scalars, JSON-flow objects, or arrays-of-objects (emitted as `- {json}` items). */
export function emitFrontmatter(pairs: ReadonlyArray<readonly [string, unknown]>): string {
  const lines: string[] = ["---"];
  for (const [k, v] of pairs) {
    if (Array.isArray(v) && v.length > 0 && v.every((x) => x !== null && typeof x === "object")) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${JSON.stringify(item)}`);
    } else {
      lines.push(`${k}: ${yamlScalar(v)}`);
    }
  }
  lines.push("---");
  return lines.join("\n") + "\n";
}

function parseScalar(raw: string): unknown {
  const t = raw.trim();
  if (t === "null" || t === "~") return null;
  try {
    return JSON.parse(t);
  } catch {
    return t; // bare scalar
  }
}

/** Parse a .md file: frontmatter (this module's dialect) + `## key` prose sections.
 *  Throws on structural failure — the importer catches and files a per-item issue. */
export function parseMarkdownDoc(text: string): FrontmatterDoc {
  const lf = text.replace(/\r\n/g, "\n"); // tolerate editors that saved CRLF
  const lines = lf.split("\n");
  if (lines[0] !== "---") throw new Error("missing frontmatter open '---' on line 1");
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") { close = i; break; }
  }
  if (close === -1) throw new Error("missing frontmatter close '---'");

  const fm: Record<string, unknown> = {};
  let listKey: string | null = null;
  for (let i = 1; i < close; i++) {
    const line = lines[i]!;
    if (line.trim().length === 0) continue;
    const item = /^ {2}- (.*)$/.exec(line);
    if (item) {
      if (listKey === null) throw new Error(`list item without a key on line ${i + 1}`);
      (fm[listKey] as unknown[]).push(JSON.parse(item[1]!));
      continue;
    }
    const kv = /^([A-Za-z][A-Za-z0-9_.-]*):(.*)$/.exec(line);
    if (!kv) throw new Error(`unparseable frontmatter line ${i + 1}: ${line}`);
    const key = kv[1]!;
    const rest = kv[2]!;
    if (rest.trim().length === 0) {
      fm[key] = [];
      listKey = key;
    } else {
      fm[key] = parseScalar(rest);
      listKey = null;
    }
  }

  const sections: Record<string, string> = {};
  let current: string | null = null;
  let buf: string[] = [];
  const flush = (): void => {
    if (current !== null) sections[current] = buf.join("\n").trim();
  };
  for (let i = close + 1; i < lines.length; i++) {
    const line = lines[i]!;
    const h = /^## (.+)$/.exec(line);
    if (h) { flush(); current = h[1]!.trim(); buf = []; continue; }
    if (current !== null) buf.push(line);
    // text before the first `## ` section (the `# <name>` display header) is presentation only
  }
  flush();
  return { fm, sections };
}

/** A body field is prose-rendered (a `## field` markdown section) only when the
 *  rendering is exactly invertible: non-empty trimmed string, no line starting
 *  with '#' (which would forge a section/header). Everything else stays in the
 *  frontmatter `body:` JSON. Deterministic — export and import share this rule. */
export function isProseSafe(v: unknown): v is string {
  if (typeof v !== "string" || v.length === 0) return false;
  if (v.trim() !== v) return false;
  if (v.includes("\r")) return false;
  return !v.split("\n").some((line) => line.startsWith("#"));
}

/** Split a body into { prose fields (ordered), frontmatter remainder }. `name`
 *  lives in the head frontmatter and the H1, never in either bucket. */
export function splitBody(body: Record<string, unknown>): {
  prose: Array<[string, string]>;
  rest: Record<string, unknown>;
} {
  const prose: Array<[string, string]> = [];
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === "name") continue;
    if (isProseSafe(v)) prose.push([k, v]);
    else rest[k] = v;
  }
  return { prose, rest };
}

/** Inverse of splitBody: reconstruct the head body from a parsed entry .md. */
export function joinBody(doc: FrontmatterDoc): Record<string, unknown> {
  const body: Record<string, unknown> = { ...((doc.fm.body ?? {}) as Record<string, unknown>) };
  for (const [k, v] of Object.entries(doc.sections)) body[k] = v;
  if (typeof doc.fm.name === "string") body.name = doc.fm.name;
  return body;
}
