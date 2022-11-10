# Landesmuseen Schleswig-Holstein WebAR Frontend app

Here are a few technical notes on the specifics of the Frontend app for the [Schleswig-Holstein State Museums](https://landesmuseen.sh/) WebAR platform. Please refer to the [README.md](../README.md) in the root folder for the platform installation and usage instructions.

## Description

This is a [SPA](https://en.wikipedia.org/wiki/Single-page_application) developed with [Vue 3](https://vuejs.org/) and running within a [Vite](https://vitejs.dev/) environment. Within the overall platform environment, the app runs inside its own [Docker](https://www.docker.com/) container.

Based on the current route, the app fetches the content data from the Strapi CMS API (part of the platform) and builds the expected view accordingly (refer to `/src/router/index.js` to check how routes and views are related). Components and views are authored using [Single-File Components](https://vuejs.org/guide/introduction.html#single-file-components) format and [Composition API](https://vuejs.org/guide/introduction.html#composition-api) scripting.

The app was designed as a mobile-first experience. Content refers to locations and objects from Landesmuseen Schleswig-Holstein museums, about which NEEEU designed and developed Augmented Reality scenes. These scenes are triggered by this frontend app, using intent links to mobile AR applications ([Quicklook API](https://cwervo.com/writing/quicklook-web/) in iOS, [Scene Viewer API](https://developers.google.com/ar/develop/scene-viewer#3d-or-ar) in Android), giving users access to AR scenes that are related to the content they are seeing on the website.

The app is configured to support content in 3 languages (English, German and Danish - see details about the `/src/i18n` folder below).

## File and folder structure

Here is a brief description of the app's folder structure and where to find different application components:

- `vite.config.js`: This is the Vite config file. For more details on how to configure Vite, see [here](https://vitejs.dev/config).
  
- `package.json` / `package.config.json`: the [Node.js](https://nodejs.org/en/about/) project files. `package.json` has commands set to trigger the linting/formatting tools ESLint, Prettier and Stylelint. If you have the tool extensions properly installed, code linting and formatting should happen automatically as you save your changes. Refer to the root `README.md` for details on how to configure VSCode to work with the project tooling.
  
- `index.html`: the main HTML file, which calls for the Vue scripts that actually render content in the page. Here you find the configuration regarding page metadata, title, and favicons.

- `Dockerfile` / `Dockerfile.dev`: respectively the production and development Docker environment configuration files. These files are called once you run docker compose up in the root folder. Check the [Dockerfile reference](https://docs.docker.com/engine/reference/builder/) for more details.

- `.eslintrc.js` / `.prettierrc` / `.stylelintrc.js`: respectively [ESLint](https://eslint.org/), [Prettier](https://prettier.io/) and [Stylelint](https://stylelint.io/) configuration files. Install these tools in your code editor in order to have linting and formatting according to these settings. If you are using VSCode, the root `README.md` has recommended editor configuration settings for this tooling set.

- `/src`: the actual app source code files. It contains the following files and folders:

  - `main.js`: the Vue app main script called by `index.html`, which triggers the rendering/reactivity systems from the framework. Here the Vue addons are declared and attached to the `App.vue` root component. This app uses [Pinia](https://pinia.vuejs.org/) (state management store), [Vue Router](https://router.vuejs.org/) (routing system), [Vue Cookies](https://github.com/cmp-cc/vue-cookies#readme) (cookies management) and [Vue i18n](https://kazupon.github.io/vue-i18n/) (localization system). Also in this file the app-wide CSS styles and variables are imported (`/assets/styles/main.css`).

  - `App.vue`: the Vue root component. This is loaded by `main.js` once `index.html` loads. All views and components are rendered through the root component.

  - `/views`: the folder that contains all app views. See `router/index.js` for details on which routes are associate with which views.

  - `/stores`: here you can find all [Pinia](https://pinia.vuejs.org/) store files:
  
    - `ar.js`: holds data about the client OS (if iOS or Android);

    - `museum.js`: holds data about the current museum;

    - `settings.js`: holds user settings data regarding language, accessibility and cookies;

    - `station.js`: holds data about the current station / AR location.

  - `/router/index.js`: the [Vue Router](https://router.vuejs.org/) configuration file. Here you can check how routes are mapped to views.

  - `/i18n`: here you can find the [Vue i18n](https://kazupon.github.io/vue-i18n/) configuration file (`i18n.js`) as well as the `/locales` folder, which contain JSON files with static text content for each language (`en.json`, `de.json`, `da.json`). In case you need to edit the localization JSON files, keep in mind that they need to have the same structure (parent-child relations, key names) between them, otherwise Vue i18n won't find specific translations on language change.

  - `/components`: the folder that holds all application components.

  - `/assets`: here all static assets are stored. They are organized as it follows:

    - `/fonts`: the font files used by the app;
  
    - `/icons`: holds all .svg icons used by the UI;

    - `/images`: holds all static images and vector illustrations used by the UI;

    - `/styles`: holds three CSS files that contain global styling rules and variables:

      - `fonts.css`: loads and names all fonts in `assets/fonts` folder;
  
      - `variables.css`: contains all global variables, such as color, typography and layout related variables;

      - `main.css`: contains the global CSS rules, and loads `fonts.css` and `variables.css`. It is imported in `main.js` at the root of the frontend app folder.

    - `/public`: this folder holds assets and files that should be easily available to `index.html` and do not need to go through `Vite` building process, such as favicons, `.webmanifest` and `browserconfig.xml` files, and so on.

    - `/nginx/nginx.conf`: this is the configuration file for the [Nginx](https://nginxproxymanager.com/) web server. This is only used in production, since in development the app is served by Vite.

## Installing and running this app

The Frontend app is configured to run as a service within a Docker container. The Docker compose files (at the project root folder) are used to run the app. Check the [README.md](../README.md) in the root folder for the platform installation and usage instructions.

You need some content data in order for the frontend app to render pages properly. If there are no museum or AR-location content data, the app redirects to an error page. Before accessing the frontend app, make sure to have at least one complete museum entry and one complete AR-location/station entry in the CMS. Check the `/src/views/Welcome.vue` and `/src/views/Station.vue` to verify how the app fetches data and checks for its completeness.
