# Stage 1: Install Chrome and prepare development environment
FROM ghcr.io/puppeteer/puppeteer:21.3.4 as development

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
# build folder: dist
RUN npm run build 


# Stage 2: Prepare the final production image
FROM node:18-alpine as production

ARG NODE_ENV=production

# Set environment variables 
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --only=production

# Copy the compiled code from the development stage
COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/server.js"]