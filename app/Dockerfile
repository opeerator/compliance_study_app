# Use an official Node.js runtime as a parent image
FROM node:20.13.1

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install -g @expo/cli

# Copy the rest of your application code to the container
COPY . .

RUN npm install

RUN npm install -g @expo/ngrok@^4.1.0
# Expose port 19000 for Expo
EXPOSE 19000


# Start the Expo server
CMD ["npx", "expo", "start", "--tunnel"]
