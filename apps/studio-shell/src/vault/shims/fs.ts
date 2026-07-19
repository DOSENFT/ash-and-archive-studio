// node:fs shim — exporter/importer (SPEC-001 §9) are host-bridge territory in the
// webview; these exist so the module graph resolves. Calling one is a defect until
// the export bridge lands (recorded in the build report, not silent).
const unavailable = (name: string) => (): never => {
  throw new Error(`node:fs.${name} is not available in the webview (export/import run via the host bridge).`);
};
export const copyFileSync = unavailable("copyFileSync");
export const existsSync = (): boolean => false;
export const mkdirSync = unavailable("mkdirSync");
export const rmSync = unavailable("rmSync");
export const writeFileSync = unavailable("writeFileSync");
export const readFileSync = unavailable("readFileSync");
export const readdirSync = unavailable("readdirSync");
export const statSync = unavailable("statSync");
