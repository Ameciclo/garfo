# Use uma imagem base do Node.js
FROM node:18.16.1

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos do projeto para o diretório de trabalho
COPY . .

# Exponha a porta que a aplicação Express.js está ouvindo
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "node", "index.js" ]
