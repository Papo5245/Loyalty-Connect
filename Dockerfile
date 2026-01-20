FROM node:18-slim

WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Puerto que exige Google Cloud Run
ENV PORT=8080
EXPOSE 8080

# Comando para arrancar basado en tu consola (tsx server/index.ts)
CMD [ "npx", "tsx", "server/index.ts" ]