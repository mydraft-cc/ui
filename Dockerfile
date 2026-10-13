FROM node:22-alpine

WORKDIR /src

COPY package*.json /src/

# Vendored packages that are referenced from package.json
COPY vendor /src/vendor/

# Install Node packages 
RUN npm install --loglevel=error

# Copy the rest
COPY . .

# Test Frontend
RUN npm run test:ci

# Build Frontend
RUN npm run build

# Expose the default vite port.
EXPOSE 5173

# Automatically start the server.
ENTRYPOINT ["npm", "start"]
