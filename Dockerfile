# Stage 1: Build and install dependencies
FROM node:18 as builder

# Set environment variable for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Copy the source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM ghcr.io/puppeteer/puppeteer:21.3.4 as production

# Set environment variables 
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Copy the compiled code from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port 
EXPOSE 4200

CMD ["node", "dist/server.js"]