#!/bin/bash

# Vue 项目 Docker 部署脚本

set -e

echo "🚀 开始部署 Vue 项目..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 构建 Vue 项目
echo -e "${YELLOW}📦 步骤 1: 构建 Vue 项目...${NC}"
npm install
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 构建失败：dist 目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建完成${NC}"

# 2. 选择部署方式
echo -e "${YELLOW}📋 选择部署方式：${NC}"
echo "1) Bind Mount - 开发环境（推荐）"
echo "2) Named Volume - 生产环境"
echo "3) 构建自定义镜像"
read -p "请选择 (1/2/3): " choice

case $choice in
    1)
        echo -e "${YELLOW}🔧 使用 Bind Mount 部署...${NC}"
        docker-compose --profile dev up -d
        ;;
    2)
        echo -e "${YELLOW}🔧 使用 Named Volume 部署...${NC}"
        
        # 创建卷（如果不存在）
        docker volume create vue-app-html 2>/dev/null || true
        docker volume create vue-app-config 2>/dev/null || true
        
        # 复制文件到卷
        echo -e "${YELLOW}📂 复制文件到数据卷...${NC}"
        docker run --rm \
          -v vue-app-html:/data \
          -v $(pwd)/dist:/source \
          alpine sh -c "rm -rf /data/* && cp -r /source/* /data/"
        
        docker run --rm \
          -v vue-app-config:/data \
          -v $(pwd)/nginx.conf:/source/nginx.conf \
          alpine sh -c "cp /source/nginx.conf /data/default.conf"
        
        # 启动容器
        docker-compose --profile prod up -d
        ;;
    3)
        echo -e "${YELLOW}🔧 构建自定义镜像...${NC}"
        docker-compose --profile build up -d --build
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

# 3. 检查容器状态
echo -e "${YELLOW}🔍 检查容器状态...${NC}"
sleep 2
docker-compose ps

# 4. 显示访问信息
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}🌐 访问地址：${NC}"
echo -e "   - http://localhost:8080"
echo -e "   - http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo -e "${YELLOW}📝 常用命令：${NC}"
echo -e "   查看日志: docker-compose logs -f"
echo -e "   停止服务: docker-compose down"
echo -e "   重启服务: docker-compose restart"
