# 1. Start with a lightweight and secure Node.js base image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json first
# This takes advantage of Docker's layer caching to speed up future builds
COPY package*.json ./

# 4. Install ONLY production dependencies
# This command reads your package.json and skips "devDependencies" (like nodemon),
# making your image smaller and more secure.
RUN npm install --production

# 5. Copy the rest of your application's source code
# (server.js, Config/, Routes/, etc.)
COPY . .

# 6. Inform Docker that the container listens on port 5000
EXPOSE 5000

# 7. Define the command to run your app using the npm start script
# This is the recommended way to start your application.
CMD [ "npm", "start" ]