# 多阶段构建 - 减小镜像体积
# 阶段 1: 构建 Vue 项目
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建生产版本（--outDir dist 覆盖 vite.config.js 里的自定义路径）
RUN npm run build -- --outDir dist

# 阶段 2: 使用 Nginx 运行
FROM nginx:alpine

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
