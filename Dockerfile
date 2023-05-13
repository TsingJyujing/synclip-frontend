FROM node:20-slim as build-deps
WORKDIR /usr/src/app
# Install packages
COPY package.json yarn.lock tsconfig.json ./
RUN yarn
# Build
COPY src/ src/
COPY public/ public/
# See https://create-react-app.dev/docs/adding-custom-environment-variables/
ARG REACT_APP_BACKEND_API_ENDPOINT
RUN yarn build

# Nginx
FROM nginx:stable-alpine-slim
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]