FROM squidex/dotnet:2.2-sdk-chromium-phantomjs-node

WORKDIR /src

COPY package*.json /src/

# Install Node packages 
RUN npm install --loglevel=error

# Copy the rest
COPY . .

# Test Frontend
RUN npm run test:coverage

# Build Frontend
RUN npm run build

