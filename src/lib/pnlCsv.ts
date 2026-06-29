/**
 * Wallet PnL CSV export.
 *
 * The implementation lives in ./csv (co-located with csvCell) so the value
 * import stays same-file and the builder remains loadable by the bare
 * `node --test` runner. This module re-exports it as the stable
 * `@/lib/pnlCsv` entry point used by the wallet UI.
 */
export { buildPnlCsv } from "./csv";
export type { PnlCsvInput } from "./csv";
