# Use an official Node.js runtime as a parent image
FROM node:14.16
LABEL authors="Wembley"

# Set environment variables
ENV DOTENV_KEY="dotenv://:key_b7c5e62ce90352ffc94ec105280be64505df23cb71cee741bd903c3b86b9ca08@dotenv.org/vault/.env.vault?environment=production"

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application
COPY . .

# Generate .env.vault from
RUN npx dotenv-vault@latest new vlt_38d1b90e651e02920c2f5a38636d8580fdaa3d850e5c1b232e2ec22b259fb6a6 -y

# Pull in environment variables
RUN npx dotenv-vault@latest pull production .env --dotenvMe=me_d533c8217b202e3294f452e20a45ee935093610d3205dc85fb9ec39e73025fdc -y

# Build TypeScript libraries
CMD ["npm", "run", "build"]

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the app
CMD ["npm", "run", "start"]
