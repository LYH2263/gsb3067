FROM node:18-alpine

# 安装 libc6-compat 以提高对原生模块的兼容性
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

# 安装依赖
RUN npm install

COPY . .

# 确保 uploads 目录存在
RUN mkdir -p uploads && chmod 777 uploads

EXPOSE 3067

CMD ["node", "server.js"]
