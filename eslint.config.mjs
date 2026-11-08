import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["out/**", "dist/**", "node_modules/**", "examples/**", "resources/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "max-len": ["error", { code: 120 }],
      "no-nested-ternary": "error",
      "max-lines-per-function": ["error", { max: 40 }],
      "no-trailing-spaces": "error"
    }
  }
);
