# ---------- Etapa 1: compilar React con Vite ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias (se cachea si no cambia package.json)
COPY package*.json ./
RUN npm install

# Copiar el resto del código y compilar -> genera /app/dist
COPY . .
RUN npm run build

# ---------- Etapa 2: servir los archivos estáticos con Nginx ----------
FROM nginx:alpine

# Copiar el front ya compilado desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Nuestra configuración de Nginx (SPA + proxy a la API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
