FROM node:latest as dependencies-gatherer

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

FROM node:latest as app-runner

COPY --from=dependencies-gatherer /app/node_modules node_modules
COPY --from=dependencies-gatherer /app/package.json package.json
COPY tsconfig.json tsconfig.json
COPY tsconfig.prod.json tsconfig.prod.json
COPY src src

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
