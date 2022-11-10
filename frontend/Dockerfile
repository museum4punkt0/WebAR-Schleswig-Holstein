FROM node:16-alpine AS build-stage

RUN mkdir /app
WORKDIR /app

COPY package.json ./

RUN npm install

COPY . ./

ARG VITE_API_BASE_URL                    
ENV VITE_API_BASE_URL $VITE_API_BASE_URL

ARG APP_PORT                       
ENV APP_PORT $APP_PORT

ARG APP_BASE_URL                       
ENV APP_BASE_URL $APP_BASE_URL

ARG VITE_ASSETS_BASE_URL                       
ENV VITE_ASSETS_BASE_URL $VITE_ASSETS_BASE_URL

ARG VITE_STRAPI_AUTH_TOKEN                       
ENV VITE_STRAPI_AUTH_TOKEN $VITE_STRAPI_AUTH_TOKEN


RUN npm run build

# production stage
FROM nginx AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]