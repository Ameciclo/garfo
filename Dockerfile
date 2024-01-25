# Use uma imagem base do Node.js
FROM node:18.19.0

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos do projeto para o diretório de trabalho
COPY . .

# Execute o aplicativo usando o comando "npm start"
CMD [ "npm", "start" ]