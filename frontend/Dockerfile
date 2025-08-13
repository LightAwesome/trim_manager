FROM node:20 AS dev

WORKDIR /app

# Copy only package.json and package-lock.json for caching
COPY package*.json ./

# Install deps for Linux ARM64 so correct rollup binary gets installed
RUN npm ci --platform=linux --arch=arm64

# Now copy the rest of the project
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
