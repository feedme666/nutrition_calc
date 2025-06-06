# Nutrition Calculator

A small web application that helps plan enteral nutrition infusions. The UI is in Japanese and it calculates rates and schedules based on user input.

## Installation

Install the dependencies using npm:

```bash
npm install
```

## Development server

Start a local dev server with hot reload:

```bash
npm run dev
```

The app is built with [Vite](https://vitejs.dev/) and expects a `base` path of `/nutrition_calc/` when deployed to GitHub Pages.

## Build

Create an optimized production build in the `dist` folder:

```bash
npm run build
```

## Deployment

This project uses the `gh-pages` package to publish the production build. Running the following commands will build the project and push the `dist` directory to the `gh-pages` branch of this repository:

```bash
npm run predeploy
npm run deploy
```

The site will then be available at the URL configured in the `homepage` field of `package.json`.

