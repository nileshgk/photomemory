# --- STEP 1: OS LAYER ---
# Using node:18-alpine to minimize the attack surface and keep the image size under 200MB.
FROM node:18-alpine

# --- STEP 2: WORKSPACE ---
# Standardizing the application path for container consistency.
WORKDIR /app

# --- STEP 3: DEPENDENCY CACHING ---
# Copy package files first. This layer is only rebuilt if dependencies change.
COPY package*.json ./

# --- STEP 4: CLEAN INSTALL ---
# --production ensures dev tools (like testing frameworks) aren't shipped to the cloud.
RUN npm install --production

# --- STEP 5: SOURCE CODE ---
# Copying the actual logic (index.js, routes, etc.) after dependencies are installed.
COPY . .

# --- STEP 6: NETWORKING ---
# Documenting that the internal Express server runs on port 5000.
EXPOSE 5000

# --- STEP 7: SELF-HEALING (DevOps Essential) ---
# This allows the orchestrator (Docker/AWS) to auto-restart the container if the app crashes.
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# --- STEP 8: RUNTIME ---
# Using the direct node runtime to execute the entry point.
CMD ["node", "index.js"]
