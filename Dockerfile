FROM node:18.19.0

WORKDIR /app

# Copiar package files primeiro para cache de layers
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 8080

CMD ["npm", "start"]