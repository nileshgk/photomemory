# --- STAGE 1: COMPILATION (The Build Environment) ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Generates the production-ready /dist folder containing static HTML/JS/CSS.
RUN npm run build

# --- STAGE 2: SERVING (The Production Environment) ---
# We discard the heavy Node.js image and switch to Nginx for high-performance static serving.
FROM nginx:stable-alpine

# Copy ONLY the compiled /dist folder from the 'build' stage into Nginx's public path.
COPY --from=build /app/dist /usr/share/nginx/html

# Port 80 is the standard for HTTP traffic.
EXPOSE 80

# Run Nginx in the foreground so the container stays alive.
CMD ["nginx", "-g", "daemon off;"]
