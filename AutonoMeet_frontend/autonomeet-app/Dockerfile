FROM node:20

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto 5173 (usado por Vite)
EXPOSE 5173

# Iniciar el servidor de desarrollo con Vite, configurando el host a 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
