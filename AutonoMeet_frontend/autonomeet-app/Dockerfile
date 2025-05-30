FROM node:20

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto del servidor de desarrollo (ajusta según tu script dev)
EXPOSE 5173

# Iniciar el servidor de desarrollo
CMD ["npm", "run", "dev"]
