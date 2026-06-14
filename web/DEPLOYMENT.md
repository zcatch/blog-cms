# Vue 项目 Docker 部署指南

## 📋 部署步骤

### 1️⃣ 准备工作

确保已安装：
- Docker
- Docker Compose

检查版本：
```bash
docker --version
docker-compose --version
```

### 2️⃣ 构建并运行

#### 方式一：使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

#### 方式二：使用 Docker 命令

```bash
# 构建镜像
docker build -t vue-learning-app .

# 运行容器
docker run -d -p 8080:80 --name vue-app vue-learning-app

# 查看运行状态
docker ps

# 查看日志
docker logs -f vue-app

# 停止并删除容器
docker stop vue-app
docker rm vue-app
```

### 3️⃣ 访问应用

浏览器打开：
- 本地访问：http://localhost:8080
- 服务器访问：http://服务器IP:8080

---

## 🌐 域名访问配置

### 方案一：本地测试 - 修改 hosts 文件

**Windows 系统：**
```bash
# 1. 以管理员身份打开记事本
# 2. 打开文件：C:\Windows\System32\drivers\etc\hosts
# 3. 添加以下内容：
127.0.0.1  myapp.local
127.0.0.1  www.myapp.local

# 4. 保存文件
# 5. 刷新 DNS 缓存
ipconfig /flushdns
```

**Linux/Mac 系统：**
```bash
# 编辑 hosts 文件
sudo nano /etc/hosts

# 添加以下内容：
127.0.0.1  myapp.local
127.0.0.1  www.myapp.local

# 保存后刷新 DNS（Mac）
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

访问：http://myapp.local:8080

### 方案二：生产环境 - 真实域名

#### 前提条件：
1. 拥有一个域名（如：example.com）
2. 域名 DNS 已指向服务器 IP
3. 服务器防火墙开放 80 和 443 端口

#### 步骤 1：修改 nginx.conf

```nginx
server {
    listen 80;
    server_name example.com www.example.com;  # 修改为你的域名
    
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 步骤 2：修改 docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: vue-learning-app
    ports:
      - "80:80"      # 改为 80 端口
      - "443:443"    # HTTPS 端口
    restart: unless-stopped
```

#### 步骤 3：重新构建并启动

```bash
docker-compose down
docker-compose up -d --build
```

访问：http://example.com

### 方案三：使用 Nginx 反向代理（推荐生产环境）

如果服务器上已有 Nginx，可以配置反向代理：

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 配置 HTTPS（可选）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取证书并自动配置 Nginx
sudo certbot --nginx -d example.com -d www.example.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 🛠️ 常用管理命令

### Docker Compose 命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 重新构建
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

### Docker 命令

```bash
# 查看所有容器
docker ps -a

# 查看镜像
docker images

# 进入容器
docker exec -it vue-app sh

# 查看容器日志
docker logs -f vue-app

# 删除容器
docker rm -f vue-app

# 删除镜像
docker rmi vue-learning-app

# 清理未使用的资源
docker system prune -a
```

---

## 🔍 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
netstat -tuln | grep 8080
# 或
lsof -i :8080
```

### 2. 页面无法访问

```bash
# 检查容器是否运行
docker ps

# 检查 Nginx 配置
docker exec vue-app nginx -t

# 查看 Nginx 日志
docker exec vue-app cat /var/log/nginx/error.log
```

### 3. 路由刷新 404

确保 nginx.conf 中有：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 4. 静态资源加载失败

检查 vite.config.js 中的 base 配置：
```javascript
export default defineConfig({
  base: '/',  // 确保是根路径
  // ...
})
```

---

## 📝 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 清理旧镜像（可选）
docker image prune -f
```

---

## 🎯 性能优化建议

1. **启用 Gzip 压缩**（已在 nginx.conf 中配置）
2. **配置静态资源缓存**（已在 nginx.conf 中配置）
3. **使用 CDN** 加速静态资源
4. **配置 HTTP/2**（需要 HTTPS）
5. **使用多阶段构建**（已在 Dockerfile 中实现）

---

## 📌 注意事项

1. 生产环境建议使用 80 端口（HTTP）和 443 端口（HTTPS）
2. 确保服务器防火墙开放相应端口
3. 定期备份数据和配置文件
4. 使用环境变量管理敏感信息
5. 配置日志轮转避免日志文件过大
