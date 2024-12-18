import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import eslintPluginImportX from "eslint-plugin-import-x";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
export default [
    { files: ["**/*.{ts}"] },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
        }
    },
    eslintPluginImportX.flatConfigs.recommended,
    eslintPluginImportX.flatConfigs.typescript,
    {
        files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
        ignores: ["eslint.config.js"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module"
        },
        rules: {
            "no-unused-vars": "off",
            "import-x/no-dynamic-require": "warn",
            "import-x/no-nodejs-modules": "warn"
        }
    },
    {
        settings: {
            "import-x/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json"
                },
                node: {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                    moduleDirectory: ["node_modules", "src/"]
                }
            }
        }
    }
];
