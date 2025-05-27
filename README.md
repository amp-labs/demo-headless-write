# Headless @amp-labs sample app

A React TypeScript application that demonstrates the @amp-labs/react headless library. The app allows users to map dynamic fields to Salesforce fields and manage installations.

## Features

- Map dynamic fields to provider (i.e. Salesforce/Hubspot) fields
- Handle read permissions for fields (config.readObjects)
- Create and manage installations with configuration management (useConfig)
- CRUD installation hooks

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI Components
- Ampersand Headless (@amp-labs/react)

## Setup Requirements

### 1. Environment Variables

Create a `.env` file with the following variables:

```
VITE_AMP_PROJECT_ID=your_project_id
VITE_AMP_API_KEY=your_api_key
VITE_AMP_INTEGRATION=your_integration_id
```

### 2. Dependencies Installation

```bash
yarn install
```

### 3. Development

```bash
yarn dev
```

### 4. Build

```bash
yarn build
```

## Project Structure

```
src/
├── components/
│   ├── FieldMappingTable/
│   │   └── FieldMappingTable.tsx    # Main field mapping component
│   ├── ui/                          # Shadcn UI components
├── lib/
│   └── utils.ts                     # Utility functions
└── App.tsx                          # Main application component
```

## Development Requirements

- Node.js (latest LTS version recommended)
- Yarn package manager
- Modern web browser
- Access to Ampersand Labs API credentials

## Additional Notes

- The app uses Shadcn UI for the component library
- Tailwind CSS for styling
- ESLint for code quality
- TypeScript for type safety
- Vite for build tooling and development server

---

##### Generated via Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
