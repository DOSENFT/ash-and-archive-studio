// The Charter Room — canon governance over the live vault (SPEC-001 §7).
// The room renders the four Charter surfaces exactly as core exposes them:
// the §7.5 Readiness Gate as a quiet report, the §7.4 Contradiction docket
// with the methodology's three patches, the §7.1 status machine as the two
// deliberate acts (lock asks once; demote demands its note), and the §7.2
// rulings shelf by layer. Errors are surfaced as their message text —
// audit-not-judgment (GENESIS 06 §I): the gate teaches, it never scolds.
import { useMemo, useState } from "react";
import type { Vault, EntryView, ContradictionCase, PatchChoice, ReadinessReport } from "@ash-archive/core";
import { EntryQuery, ENTRY_KINDS } from "@ash-archive/core";

// §7.2 — the rulings surface's four layers, in canon order.
const LAYERS = ["gravity", "structural", "dynamic", "local"] as const;

type PatchKind = PatchChoice["patch"];

export function CharterRoom({ vault, sessionId, announce, reducedMotion }: {
  vault: Vault;
  sessionId: string;
  announce(text: string): void;
  reducedMotion: boolean;
}) {
  void sessionId; // Charter acts are world-scoped (§7); the session belongs to the Table.
  const [tick, setTick] = useState(0); // re-derive after every Charter act
  const bump = () => setTick((t) => t + 1);

  // ---- derived state (all reads go through the §5/§7 surfaces) ----

  const readiness: ReadinessReport | null = useMemo(() => {
    void tick;
    const r = vault.charter.readiness(vault.worldId);
    return r.ok ? r.value : null;
  }, [vault, tick]);

  const docket: ContradictionCase[] = useMemo(() => {
    void tick;
    const r = vault.charter.docket();
    return r.ok ? r.value : [];
  }, [vault, tick]);

  const byStatus = (status: "provisional" | "locked"): EntryView[] => {
    const out: EntryView[] = [];
    for (const k of ENTRY_KINDS) {
      const r = vault.archive.query(EntryQuery.kind(k).whereStatus(status));
      if (r.ok) out.push(...r.value);
    }
    return out;
  };
  const provisional = useMemo(() => { void tick; return byStatus("provisional"); },
    [vault, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const locked = useMemo(() => { void tick; return byStatus("locked"); },
    [vault, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const rulingShelf = useMemo(() => {
    void tick;
    return LAYERS.map((layer) => {
      const r = vault.charter.rulings(layer);
      return { layer, entries: r.ok ? r.value : [] };
    });
  }, [vault, tick]);

  const nameOf = (id: string): string => {
    const r = vault.archive.get(id);
    return r.ok ? r.value.name : id;
  };

  // ---- the docket bench (resolve panel state) ----

  const [openCase, setOpenCase] = useState<string | null>(null);
  const [patch, setPatch] = useState<PatchKind>("minimal");
  const [patchEntry, setPatchEntry] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState("");
  const [truthName, setTruthName] = useState("");
  const [truthStatement, setTruthStatement] = useState("");

  const pickEntry = (id: string) => {
    setPatchEntry(id);
    const r = vault.archive.get(id);
    // The body textarea is prefilled from the chosen entry's current head body.
    setBodyText(r.ok ? JSON.stringify(r.value.body, null, 2) : "{}");
  };

  const openResolve = (c: ContradictionCase) => {
    setOpenCase(c.id);
    setPatch("minimal");
    setTruthName("");
    setTruthStatement("");
    const first = c.entries[0];
    if (first !== undefined) pickEntry(first);
    else setPatchEntry(null);
  };

  const applyResolve = (c: ContradictionCase) => {
    let choice: PatchChoice;
    if (patch === "story") {
      if (truthName.trim() === "" || truthStatement.trim() === "") {
        announce("A story patch needs the truth's name and its statement — both entries stand, and the truth explains why.");
        return;
      }
      // §7.4 story patch: both stand; a new truth explains the discrepancy in-world.
      choice = { patch: "story", truthBody: { name: truthName.trim(), statement: truthStatement.trim() } };
    } else {
      if (patchEntry === null) {
        announce("Choose which entry the patch amends before the bench can rule.");
        return;
      }
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(bodyText) as Record<string, unknown>;
      } catch {
        announce("The body must be valid JSON before the bench can rule on it.");
        return;
      }
      choice = { patch, entryId: patchEntry, body };
    }
    const r = vault.charter.resolve(c.id, choice, "owner");
    if (!r.ok) { announce(r.error.message); return; }
    announce("Resolved."); // spec is silent on success copy; most restrained (§7.4)
    setOpenCase(null);
    bump();
  };

  // ---- lock / demote (the §7.1 deliberate acts) ----

  const [pendingLock, setPendingLock] = useState<string | null>(null);
  const [pendingDemote, setPendingDemote] = useState<string | null>(null);
  const [demoteNote, setDemoteNote] = useState("");

  const confirmLock = (e: EntryView) => {
    const r = vault.charter.lock(e.id, "owner");
    setPendingLock(null);
    // Lock failures (E-1003 Lever Test, I-4 pencil) ARE the gate teaching —
    // the message text is the lesson; no code is shown.
    if (!r.ok) { announce(r.error.message); return; }
    announce("Locked."); // spec-silent success copy; restrained (§7.1)
    bump();
  };

  const confirmDemote = (e: EntryView) => {
    const r = vault.charter.demote(e.id, "owner", demoteNote);
    if (!r.ok) { announce(r.error.message); return; } // note-required teaching included
    announce("Demoted. The note stands in the record."); // §7.1: demote carries its note
    setPendingDemote(null);
    setDemoteNote("");
    bump();
  };

  return (
    <div className={`lr-room${reducedMotion ? " lr-reduced" : ""}`}>

      {/* ————— the Readiness report (§7.5) ————— */}
      <section className="lr-sheet">
        <p className="lr-title"><i>the</i> READINESS</p>
        {readiness === null ? (
          <p className="lr-void">The gate has nothing to weigh yet.</p>
        ) : (
          <>
            <p className="lr-verdict">{readiness.verdict}</p>
            <table className="lr-domains">
              <thead>
                <tr><th>domain</th><th>count</th><th>min</th><th>met</th></tr>
              </thead>
              <tbody>
                {readiness.domains.map((d) => (
                  <tr key={d.domain}>
                    <td>{d.domain}</td>
                    <td className="lr-num">{d.count}</td>
                    <td className="lr-num">{d.min}</td>
                    <td className={d.met ? "lr-met" : "lr-short"}>{d.met ? "met" : "short"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {readiness.missing.length > 0 ? (
              <div className="lr-guidance">
                {/* missing minimums + smallestNextBuild rendered as craft guidance,
                    not as failure — the exact refusal format §7.5 dictates. */}
                {readiness.missing.map((m) => (
                  <p key={`${m.domain}:${m.need}`} className="lr-note">{m.domain}: {m.have} of {m.need}</p>
                ))}
                {readiness.smallestNextBuild.map((s, i) => (
                  <p key={i} className="lr-hint">{s.action} · {s.kind} — {s.hint}</p>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* ————— the Contradiction docket (§7.4) ————— */}
      <section className="lr-sheet">
        <p className="lr-title"><i>the</i> DOCKET</p>
        {docket.length === 0 ? (
          <p className="lr-void">The docket is clear. Nothing contradicts.</p>
        ) : docket.map((c) => (
          <div key={c.id} className="lr-case">
            <div className="lr-case-head">
              <span className="lr-case-kind">{c.kind}</span>
              <span className="lr-case-entries">{c.entries.map(nameOf).join(" · ")}</span>
            </div>
            <p className="lr-case-expl">{c.explanation}</p>
            {openCase === c.id ? (
              <div className="lr-resolve">
                <div className="lr-patches" role="radiogroup" aria-label="Patch choice">
                  {/* §7.4 — the methodology's three patches */}
                  <button type="button" className={`lr-patch${patch === "minimal" ? " lr-on" : ""}`}
                    role="radio" aria-checked={patch === "minimal"}
                    onClick={() => setPatch("minimal")}>minimal — edit the incoming draft</button>
                  <button type="button" className={`lr-patch${patch === "clean" ? " lr-on" : ""}`}
                    role="radio" aria-checked={patch === "clean"}
                    onClick={() => setPatch("clean")}>clean — a new version of the existing entry</button>
                  <button type="button" className={`lr-patch${patch === "story" ? " lr-on" : ""}`}
                    role="radio" aria-checked={patch === "story"}
                    onClick={() => setPatch("story")}>story — both stand; a truth explains</button>
                </div>
                {patch === "story" ? (
                  <div className="lr-fields">
                    <input className="lr-field" type="text" placeholder="the truth's name"
                      aria-label="Truth name" value={truthName}
                      onChange={(e) => setTruthName(e.target.value)} />
                    <input className="lr-field" type="text" placeholder="its statement — why both stand"
                      aria-label="Truth statement" value={truthStatement}
                      onChange={(e) => setTruthStatement(e.target.value)} />
                  </div>
                ) : (
                  <div className="lr-fields">
                    <div className="lr-entry-pick" role="radiogroup" aria-label="Which entry the patch amends">
                      {c.entries.map((id) => (
                        <button key={id} type="button"
                          className={`lr-patch${patchEntry === id ? " lr-on" : ""}`}
                          role="radio" aria-checked={patchEntry === id}
                          onClick={() => pickEntry(id)}>{nameOf(id)}</button>
                      ))}
                    </div>
                    <textarea className="lr-body-edit" aria-label="Entry body (JSON)"
                      value={bodyText} onChange={(e) => setBodyText(e.target.value)}
                      rows={8} spellCheck={false} />
                  </div>
                )}
                <div className="lr-acts">
                  <button type="button" className="lr-act" onClick={() => applyResolve(c)}>resolve</button>
                  <button type="button" className="lr-quiet" onClick={() => setOpenCase(null)}>withdraw</button>
                </div>
              </div>
            ) : (
              <button type="button" className="lr-quiet" onClick={() => openResolve(c)}>take up the case</button>
            )}
          </div>
        ))}
      </section>

      {/* ————— lock / demote (§7.1 — the deliberate acts) ————— */}
      <section className="lr-sheet">
        <p className="lr-title"><i>the</i> CHARTER</p>
        <p className="lr-sub">provisional — pencil marks awaiting the ink of canon</p>
        {provisional.length === 0 ? (
          <p className="lr-void">Nothing is provisional. The record is settled — for now.</p>
        ) : provisional.map((e) => (
          <div key={e.id} className="lr-row">
            <span className="lr-row-kind">{e.kind}</span>
            <span className="lr-row-name">{e.name}</span>
            {pendingLock === e.id ? (
              // Locking is THE deliberate act — it asks once, inline, and never
              // through a browser dialog (§7.1; GENESIS 06: deliberation is the point).
              <span className="lr-confirm">
                <span className="lr-confirm-ask">bind this to canon?</span>
                <button type="button" className="lr-act" onClick={() => confirmLock(e)}>confirm</button>
                <button type="button" className="lr-quiet" onClick={() => setPendingLock(null)}>withdraw</button>
              </span>
            ) : (
              <button type="button" className="lr-act" onClick={() => setPendingLock(e.id)}>lock</button>
            )}
          </div>
        ))}
        <p className="lr-sub">locked — canon; demotion demands its note (§7.1)</p>
        {locked.length === 0 ? (
          <p className="lr-void">Nothing is locked yet. Canon begins with the first deliberate act.</p>
        ) : locked.map((e) => (
          <div key={e.id} className="lr-row">
            <span className="lr-row-kind">{e.kind}</span>
            <span className="lr-row-name">{e.name}</span>
            {pendingDemote === e.id ? (
              <span className="lr-confirm">
                <input className="lr-field lr-demote-note" type="text"
                  placeholder="why it returns to pencil — the note is required"
                  aria-label="Demotion note" value={demoteNote}
                  onChange={(e2) => setDemoteNote(e2.target.value)} />
                <button type="button" className="lr-act" onClick={() => confirmDemote(e)}>demote</button>
                <button type="button" className="lr-quiet"
                  onClick={() => { setPendingDemote(null); setDemoteNote(""); }}>withdraw</button>
              </span>
            ) : (
              <button type="button" className="lr-quiet" onClick={() => { setPendingDemote(e.id); setDemoteNote(""); }}>demote</button>
            )}
          </div>
        ))}
      </section>

      {/* ————— the rulings shelf (§7.2), grouped by layer ————— */}
      <section className="lr-sheet">
        <p className="lr-title"><i>the</i> RULINGS</p>
        {rulingShelf.map(({ layer, entries }) => (
          <div key={layer} className="lr-layer">
            <p className="lr-sub">{layer}</p>
            {entries.length === 0 ? (
              <p className="lr-note">—</p>
            ) : entries.map((e) => (
              <p key={e.id} className="lr-ruling">{e.name}</p>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
