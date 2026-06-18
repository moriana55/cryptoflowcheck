/**
 * Escape a CSV cell and neutralise spreadsheet formula injection.
 *
 * Cells starting with = + - @ tab or CR are prefixed with a single quote so
 * spreadsheets treat them as text instead of executing them as formulas. Cells
 * containing quote/comma/newline are RFC 4180 quoted.
 */
export function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // Prevent CSV formula injection (=, +, -, @, tab, CR).
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}
