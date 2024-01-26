# Use a specific version of node as base image
FROM node:18.19.0

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Build the application
RUN npm run build

# Your app binds to port 8080 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 8080

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "start" ]
