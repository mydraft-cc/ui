# Aggiorna la versione di Node.js
FROM node:16

# Resto del tuo Dockerfile
WORKDIR /src

COPY package*.json /src/

# Install Node packages 
RUN npm install --loglevel=error

# Copia il resto
COPY . .

# Build Frontend
RUN npm run build