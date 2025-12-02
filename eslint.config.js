import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        rules: {
            // TypeScript
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',

            // General
            'no-console': 'off',
            'prefer-const': 'warn',
            'no-var': 'error',

            // Prettier
            'prettier/prettier': 'warn',
        },
    }
);
