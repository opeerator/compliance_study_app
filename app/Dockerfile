# Use the official Node.js runtime as the base image
FROM node:20.13.1

# Set the working directory in the container
WORKDIR /app

# Install Expo CLI globally
RUN npm install -g expo-cli

# Copy the package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files into the container
COPY . .

# Expose the port that Expo CLI uses
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start the Expo project
CMD ["expo", "start", "--tunnel"]
