#!/bin/bash

# Vue 项目更新脚本

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 开始更新项目...${NC}"

# 1. 拉取最新代码
echo -e "${YELLOW}📥 拉取最新代码...${NC}"
git pull

# 2. 重新构建
echo -e "${YELLOW}📦 重新构建项目...${NC}"
npm install
npm run build

# 3. 检查当前运行的容器
if docker ps | grep -q "vue-learning-app-dev"; then
    echo -e "${YELLOW}🔧 检测到开发环境容器，重启中...${NC}"
    docker-compose --profile dev restart
elif docker ps | grep -q "vue-learning-app-prod"; then
    echo -e "${YELLOW}🔧 检测到生产环境容器，更新数据卷...${NC}"
    
    # 更新卷中的文件
    docker run --rm \
      -v vue-app-html:/data \
      -v $(pwd)/dist:/source \
      alpine sh -c "rm -rf /data/* && cp -r /source/* /data/"
    
    docker run --rm \
      -v vue-app-config:/data \
      -v $(pwd)/nginx.conf:/source/nginx.conf \
      alpine sh -c "cp /source/nginx.conf /data/default.conf"
    
    docker-compose --profile prod restart
elif docker ps | grep -q "vue-learning-app-build"; then
    echo -e "${YELLOW}🔧 检测到构建镜像容器，重新构建...${NC}"
    docker-compose --profile build up -d --build
else
    echo -e "${YELLOW}⚠️  未检测到运行中的容器${NC}"
    echo "请先运行 ./deploy.sh 进行部署"
    exit 1
fi

echo -e "${GREEN}✅ 更新完成！${NC}"
docker-compose ps
