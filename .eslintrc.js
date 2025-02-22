/* eslint-disable */

module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "extends": [
        "airbnb-typescript/base",
        "plugin:react-hooks/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json"
    },
    "plugins": [
        "eslint-plugin-import",
        "sort-keys-fix",
        "@typescript-eslint",
        "@stylistic",
    ],
    "rules": {
        "@typescript-eslint/space-before-blocks": "off",
        "@typescript-eslint/dot-notation": "off",
        "@typescript-eslint/indent": [
            "error",
            4
        ],
        "@typescript-eslint/lines-between-class-members": "off",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "variable",
                "format": [
                    "camelCase",
                    "PascalCase",
                    "UPPER_CASE",
                ],
                "leadingUnderscore": "allow",
                "trailingUnderscore": "allow",
            },
            {
                "selector": "typeLike",
                "format": [
                    "PascalCase"
                ],
            }
        ],
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-throw-literal": "off",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/return-await": "off",
        "@typescript-eslint/quotes": [
            "error",
            "single"
        ],
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "@stylistic/arrow-spacing": "error",
        "@stylistic/block-spacing": "error",
        "@stylistic/space-before-blocks": "error",
        "@stylistic/function-call-spacing": "error",
        "@stylistic/space-in-parens": "error",
        "curly": "error",
        "class-methods-use-this": "off",
        "import/export": "off",
        "import/extensions": "off",
        "import/no-cycle": "off",
        "import/no-extraneous-dependencies": "off",
        "import/no-useless-path-segments": "off",
        "import/order": ["error", {
            "pathGroupsExcludedImportTypes": ["builtin"],
            "pathGroups": [{
                "pattern": "@app/**",
                "group": "external",
                "position": "after"
            }],
            "alphabetize": {
                "order": "asc"
            }
        }],
        "import/prefer-default-export": "off",
        "arrow-body-style": "off",
        "arrow-parens": "off",
        "default-case": "off",
        "function-paren-newline": "off",
        "implicit-arrow-linebreak": "off",
        "linebreak-style": "off",
        "max-classes-per-file": "off",
        "max-len": "off",
        "newline-per-chained-call": "off",
        "no-else-return": "off",
        "no-inner-declarations": "off",
        "no-mixed-operators": "off",
        "no-nested-ternary": "off",
        "no-param-reassign": "off",
        "no-plusplus": "off",
        "no-prototype-builtins": "off",
        "no-restricted-globals": "off",
        "no-restricted-syntax": "off",
        "object-curly-newline": [
            "error", 
            {
                "ObjectExpression": { 
                    "consistent": true
                },
                "ObjectPattern": { 
                    "consistent": true
                },
                "ImportDeclaration": "never",
                "ExportDeclaration": "never"
            }
        ],
        "operator-linebreak": "off",
        "prefer-destructuring": "off",
        "sort-imports": [
            "error",
            {
                "ignoreCase": true,
                "ignoreDeclarationSort": true
            }
        ],
    }
};
