import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": "error",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
