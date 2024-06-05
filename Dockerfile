# Stage 1: Build the application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Create the runtime image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Expose the port that the NestJS app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]
