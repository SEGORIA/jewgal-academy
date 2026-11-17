import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Reglas del compilador de React (nuevas en Next 16). Marcan patrones que hoy funcionan y son habituales en el panel
    // y el aula: cargar datos al abrir una pantalla, leer localStorage / matchMedia al montar, sincronizar un borrador
    // con una prop, calcular "hace X minutos" con Date.now(). No son errores de comportamiento: quedan como AVISOS
    // visibles para migrarlos de a poco (p. ej. a una librería de datos) sin que `npm run lint` falle por ellos.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
