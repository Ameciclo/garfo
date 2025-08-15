FROM node:22.18.0

WORKDIR /app

# Copiar package files primeiro para cache de layers
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas as dependências (dev + prod) para build
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Limpar devDependencies após build
RUN npm ci --only=production && npm cache clean --force

# Expor porta
EXPOSE 8080

# Usar node diretamente para melhor performance
CMD ["node", "dist/index.js"]