import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    // Existing client stores hydrate from browser-only APIs after mount.
    // These effects synchronize React with localStorage rather than derive state.
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
]);
