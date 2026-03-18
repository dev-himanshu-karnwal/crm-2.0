# base image
FROM node:20-alpine

#install pnpm 
RUN npm install -g pnpm

# create app directory
WORKDIR /app

# copy package files
COPY package*.json pnpm-lock.yaml* ./

# install dependencies
RUN pnpm install

# copy source code
COPY . .

# build the app
RUN pnpm run build

# expose port
EXPOSE 5000

# start the app
CMD ["node", "dist/main.js"]