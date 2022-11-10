# Landesmuseen Schleswig-Holstein WebAR CMS app

Here are a few technical notes on the specifics of the CMS app for the [Schleswig-Holstein State Museums](https://landesmuseen.sh/) WebAR platform. Please refer to the [README.md](../README.md) in the root folder for the platform installation and usage instructions.

## Description

The CMS app is a [Strapi](https://strapi.io/) v4 application that allows administrators, editors and authors to manage the content of the WebAR platform. Users can create, edit, and delete content entries and upload media. Administrators can also manage registered users and content access permissions.

## Folder structure and relevant files

Here is a brief description of the app's folder structure and where to find different application components:

- `package.json` / `package.config.json`: the [Node.js](https://nodejs.org/en/about/) project files. To update Strapi or its dependencies, update the version number in `package.json` and run `npm install` (for more details see [Strapi's documentation](https://docs.strapi.io/developer-docs/latest/update-migration-guides/update-version.html#upgrading-the-dependencies)). Be aware that upgrades may require migration-specific steps (see [Strapi migration guides](https://docs.strapi.io/developer-docs/latest/update-migration-guides/migration-guides.html));

- `Dockerfile` / `Dockerfile.dev`: respectively the production and development Docker environment configuration files. These files are called once you run docker compose up in the root folder. Check the [Dockerfile reference](https://docs.docker.com/engine/reference/builder/) for more details;

- `.dockerignore`: the list of files to ignore when building the Docker image.

- `.strapi-updater.json`: a Strapi update log file. This file is used to track the latest Strapi version that was installed on the platform.

- `.eslintrc` / `.eslintignore` / `.prettierrc` / `.editorconfig`: [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) configuration files. Install these tools in your code editor in order to have linting and formatting according to these settings. If you are using VSCode, the root `README.md` has recommended editor configuration settings for this tooling set.

- `/src`: the root folder of the app's source code. It contains the following:

  - `/src/admin/app.js`: this file can be used to pass custom configuration to the Strapi admin UI. This CMS app is configured to use German as alternative language to English, and has a custom admin UI title and subtitle. For more details on other options, see [Strapi's documentation](https://docs.strapi.io/developer-docs/latest/development/admin-customization.html#configuration-options).

  - `/src/admin/webpack.config.example.js`: this file can be used to configure [Webpack](https://webpack.js.org). For more details, see [Strapi's documentation](https://docs.strapi.io/developer-docs/latest/development/admin-customization.html#webpack-configuration).
  
  - `/src/api`: the folder containing the description files of the content API. There are 5 content models in this app:
    - `museum` and `station` are **collection-type** content models. These models represent the content about museums and the AR-stations of the Schleswig-Holstein WebAR platform;
    - `accessibility`, `cookies-usage`, `legal-notice` and `privacy-policy` are **single-type** content models. These models represent content for unique pages, respectively, the accessibility, cookies usage, legal notice and privacy policy pages of the WebAR platform;

    Here is a brief description of some relevant files inside the model folder structure:

    - `/src/api/model/controllers`: the folder containing the controller files for the content model. Only two models have their controllers modified in this app: the `museum` and the `station`. These custom controllers specify what fields should be returned when querying the content model. Check the `/src/api/museum/controllers/museum.js` and `/src/api/station/controllers/station.js` files for more details.

    - `src/api/model/content-types/model/schema.json`: this file describes the content model's schema. It is used by the Strapi to generate the content model's API and the admin UI for the content model. This file can be edited directly or by using the admin UI.

    - `src/api/model/content-types/model/lifecycles.js`: this file contains functions that can run before and after the content model is created, updated, or deleted. In this app, the `museum` and `station` models have their own lifecycles functions, which generate URL-friendly slugs using [Slugify](https://github.com/simov/slugify) when a content instance is created or updated. Check the `/src/api/museum/content-types/museum/lifecycles.js` and `/src/api/station/content-types/station/lifecycles.js` files for more details.

  - `/src/components`: the folder containing the model-specific components of the app. Components are described as schemas in individual JSON files. There are two groups of components:

    - `/src/components/museum-components`: the components for the `museum` content model. These allow content creators to customize the museum page in the frontend app.
  
    - `/src/components/station-components`: the components for the `station` content model. These allow content creators to customize the AR-station/location page in the frontend app.
  
  - `/src/extensions` and `/src/index.js`: can be used to further customize Strapi. Not used in this app.

- `/database`: in case Strapi runs a local database, this folder contains the database files. Not used in this app since it uses an external PostgreSQL database.

- `/public`: the folder containing the static files of the app. These files are served by the Strapi server. The important folder here is `/public/uploads`, which contains the media files uploaded by users using the admin UI. In the Docker compose files (at the project root folder), you will notice that the `/public` folder is mounted as a volume in the container, to preserve the files uploaded by users.

- `/config`: the folder containing the configuration files of the app. These files are used by Strapi to configure the app. For this project, app configuration is done using environment variables. Please make sure your environment variables are set correctly in project root `.env`. See the [Strapi Documentation](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations.html) for more details on the configuration files.

## Installing and running this app

The CMS app is configured to run as a service within a Docker container. The Docker compose files (at the project root folder) are used to run the app. Check the [README.md](../README.md) in the root folder for the platform installation and usage instructions.

## REST API

Once the CMS app is running, the content REST API can be reached at the following endpoints. In all cases, when `locale` is specified, its value can be `en`, `de` or `da`.

- `/api/museums`: returns all data available for all museums;

- `/api/museums?filters[slug][$eq]=${slug}`: returns the data of the museum with the specified slug;

- `/api/museums?locale=xx`: returns all data available for all museums in the specified language;

- `/api/stations`: returns all data available for all AR stations;

- `/api/stations?filters[slug][$eq]=${slug}`: returns the data of the AR station with the specified slug;

- `/api/stations?locale=xx`: returns all data available for all stations in the specified language;

- `/api/accessibility?locale=xx`: returns the data of the accessibility statement page in the specified language;

- `/api/cookies-usage?locale=xx`: returns the data of the cookies usage page in the specified language;

- `/api/legal-notice?locale=xx`: returns the data of the legal notice page in the specified language;

- `/api/privacy-policy?locale=xx`: returns the data of the privacy policy page in the specified language.

### API Tokens

Strapi uses API tokens to authenticate requests. That means requests to the content API should include an authentication token specified as the `Bearer` key, in the `Authorization` header of the request. The token is generated by the CMS app's admin UI. To generate a token, follow the instructions in this [article](https://strapi.io/blog/a-beginners-guide-to-authentication-and-authorization-in-strapi).
