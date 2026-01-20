FROM node:18-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "--import", "tsx", "server/index.ts"]
