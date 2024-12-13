import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginImportX from 'eslint-plugin-import-x'
import tsParser from '@typescript-eslint/parser'
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
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

];
