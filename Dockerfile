FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18 AS production

WORKDIR /app

COPY package*.json ./
COPY --from=build /app/dist ./dist
RUN npm install --only=production

EXPOSE 3000

CMD ["sh", "-c", "node dist/migration-run.js && node dist/server.js"]
