FROM node:20

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación (si es necesario, por ejemplo, para generar algunos assets)
RUN npm run build

# Exponer el puerto (por defecto, el servidor de desarrollo de React usa 3000)
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]
