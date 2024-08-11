# Use an official Node.js runtime as a parent image
FROM node:14.16
LABEL authors="Wembley"

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript libraries
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the app
CMD ["npm", "run", "start"]
