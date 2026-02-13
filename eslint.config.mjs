import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.commonjs,
            process: true,
        },

        ecmaVersion: 12,
        sourceType: "module",
    },

    rules: {
        //'arrow-spacing': ['warn', { before: true, after: true }],
        //'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
        //'comma-dangle': ['error', 'always-multiline'],
        //'comma-spacing': 'error',
        //'comma-style': 'error',
        curly: ['error', 'multi-or-nest', 'consistent'],
        'dot-location': ['error', 'property'],
        'handle-callback-err': 'off',
        //indent: ['error', 'tab'],
        'keyword-spacing': 'warn',
        'max-nested-callbacks': ['error', { max: 4 }],
        'max-statements-per-line': ['error', { max: 2 }],
        'no-console': 'off', //required for nodejs
        'no-empty-function': 'error',
        'no-floating-decimal': 'warn',
        //'no-inline-comments': 'error',
        'no-lonely-if': 'error',
        'no-multi-spaces': 'warn',
        'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1, maxBOF: 0 }],
        'no-shadow': ['error', { allow: ['err', 'resolve', 'reject'] }],
        'no-trailing-spaces': ['warn'],
        'no-var': 'error',
        'no-undef': 'off',
        //'object-curly-spacing': ['error', 'always'],
        'prefer-const': 'error',
        semi: ['error', 'always'],
        'space-before-blocks': 'warn',
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always',
            },
        ],
        'space-in-parens': 'error',
        'space-infix-ops': 'error',
        'space-unary-ops': 'error',
        //'spaced-comment': 'error',
        yoda: 'error',
    },
}];
