import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            ecmaVersion: "latest", // Latest ECMAScript version
            sourceType: "module" // Ensure it's treated as an ES module
        },
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json" // Point ESLint to your tsconfig
                }
            }
        },
        rules: {
            "no-unused-vars": "off", // Disable because TypeScript handles this
            "import/no-dynamic-require": "warn", // Warn on dynamic require
            "import/no-nodejs-modules": "warn" // Warn on Node.js modules
        }
    },

    // Custom rule to resolve imports from src/ alias
    {
        files: ["**/*.ts"],
        settings: {
            "import/resolver": {
                typescript: {
                    project: "./tsconfig.json" // Point ESLint to your tsconfig
                }
            }
        },
        rules: {
            "import/no-unresolved": [
                "error",
                {
                    ignore: ["^src/"] // Ignore unresolved imports for the `src` alias
                }
            ]
        }
    }
];
