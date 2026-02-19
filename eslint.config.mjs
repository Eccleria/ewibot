import globals from "globals";
import js from "@eslint/js";

export default [
    js.configs.recommended, {
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.commonjs,
            process: true,
        },

        ecmaVersion: 12,
        sourceType: "module",
    },

    rules: {},
}];
