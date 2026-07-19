// node:path shim — the three pure functions core imports, POSIX-flavored.
export function join(...parts: string[]): string {
  return parts.filter((p) => p.length > 0).join("/").replace(/\/{2,}/g, "/");
}
export function dirname(p: string): string {
  const i = p.replace(/\/+$/, "").lastIndexOf("/");
  return i <= 0 ? "/" : p.slice(0, i);
}
export function resolve(...parts: string[]): string {
  return join(...parts);
}
