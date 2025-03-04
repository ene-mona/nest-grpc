# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose both REST and gRPC ports
EXPOSE 8080

# Start the gRPC server
CMD ["node", "dist/src/main.js"]
