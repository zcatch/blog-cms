// 第一章：OpenClaw 快速入门 - WSL2 + Docker 环境
export default {
  id: 'openclaw-quickstart',
  title: '第一章：OpenClaw 快速入门（WSL2 + Docker）',
  sections: [
    {
      title: '1.1 OpenClaw 是什么？',
      content: `OpenClaw 是一个开源的 AI 自动化框架，让你拥有一个真正能执行任务的 AI 助手。

核心特点：
• 本地优先 - 数据完全私有，运行在你自己的机器上
• 多平台消息路由 - 支持 Telegram、Discord、Slack、WhatsApp 等
• 系统级权限 - 可以读写文件、执行命令、控制浏览器
• 插件生态 - 50+ 内置集成，支持自定义扩展
• 模型自由 - 支持 OpenAI、Anthropic、本地 Ollama

与 ChatGPT 的区别：
• ChatGPT：只能聊天，数据上传云端
• OpenClaw：能执行任务，数据留在本地

官方资源：
• 官网：https://openclaw.im/
• GitHub：https://github.com/openclaw/openclaw
• 许可证：MIT（完全开源）`,
      code: null
    },
    {
      title: '1.2 环境准备检查',
      content: `在 WSL2 中安装 OpenClaw 前，需要确保环境就绪。

必需条件：
• WSL2 已安装（Ubuntu 20.04+ 推荐）
• Docker 已安装并运行
• Node.js 18+ 或使用 Docker 方式（推荐）
• 网络畅通（需要拉取镜像）

推荐方式：
使用 Docker 部署，避免 Node.js 版本冲突和依赖问题。`,
      code: `# 检查 WSL2 版本
wsl --version

# 检查当前发行版
cat /etc/os-release

# 检查 Docker 是否运行
docker --version
docker ps

# 检查 Docker Compose
docker compose version

# 检查网络连接
ping -c 3 github.com

# 如果需要 Node.js 方式，检查版本
node --version  # 应该 >= 18
npm --version`
    },
    {
      title: '1.3 创建项目目录',
      content: `在 WSL2 中创建专门的目录来管理 OpenClaw 项目。

目录规划：
• ~/openclaw - 主目录
• ~/openclaw/data - 数据持久化（数据库、配置）
• ~/openclaw/logs - 日志文件
• ~/openclaw/plugins - 自定义插件

注意事项：
• 不要放在 /mnt/c/ 下（Windows 文件系统性能差）
• 使用 WSL2 原生文件系统（~/ 目录）`,
      code: `# 创建项目目录结构
mkdir -p ~/openclaw/{data,logs,plugins}

# 进入项目目录
cd ~/openclaw

# 查看目录结构
tree -L 2 ~/openclaw
# 或者
ls -la ~/openclaw/

# 设置权限（确保 Docker 可以访问）
chmod -R 755 ~/openclaw`
    },
    {
      title: '1.4 Docker Compose 配置',
      content: `使用 Docker Compose 是最简单的部署方式，一键启动所有服务。

配置说明：
• 使用官方镜像或自己构建
• 挂载数据卷实现持久化
• 配置环境变量（API Key、模型选择）
• 暴露必要端口

环境变量说明：
• OPENAI_API_KEY - OpenAI API 密钥（可选）
• ANTHROPIC_API_KEY - Anthropic API 密钥（可选）
• MODEL_PROVIDER - 模型提供商（openai/anthropic/ollama）
• TELEGRAM_BOT_TOKEN - Telegram 机器人令牌`,
      code: `# 创建 docker-compose.yml
cat > ~/openclaw/docker-compose.yml << 'EOF'
version: '3.8'

services:
  openclaw:
    image: openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    ports:
      - "3000:3000"  # Web UI 端口
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./plugins:/app/plugins
    environment:
      # 模型配置（选择一个）
      - MODEL_PROVIDER=ollama  # 或 openai, anthropic
      # - OPENAI_API_KEY=your_key_here
      # - ANTHROPIC_API_KEY=your_key_here
      
      # Ollama 配置（如果使用本地模型）
      - OLLAMA_HOST=http://host.docker.internal:11434
      
      # 消息平台配置（可选）
      # - TELEGRAM_BOT_TOKEN=your_token
      # - DISCORD_BOT_TOKEN=your_token
      
      # 数据库配置
      - DATABASE_PATH=/app/data/openclaw.db
      
    # 如果使用 Ollama，需要访问宿主机
    extra_hosts:
      - "host.docker.internal:host-gateway"

  # 可选：本地 Ollama 服务
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ./data/ollama:/root/.ollama

networks:
  default:
    name: openclaw-network
EOF

# 查看配置文件
cat ~/openclaw/docker-compose.yml`
    },
    {
      title: '1.5 启动 OpenClaw',
      content: `使用 Docker Compose 一键启动服务。

启动流程：
1. 拉取镜像（首次需要时间）
2. 创建容器和网络
3. 挂载数据卷
4. 启动服务

验证方式：
• 查看容器状态
• 检查日志输出
• 访问 Web UI（如果有）`,
      code: `# 进入项目目录
cd ~/openclaw

# 启动服务（后台运行）
docker compose up -d

# 查看启动日志
docker compose logs -f openclaw

# 查看容器状态
docker compose ps

# 查看所有容器
docker ps

# 如果需要重启
docker compose restart

# 如果需要停止
docker compose down

# 停止并删除数据卷（慎用！）
docker compose down -v`
    },
    {
      title: '1.6 配置 Telegram 机器人（推荐）',
      content: `Telegram 是最容易上手的消息平台，无需复杂配置。

为什么选择 Telegram：
• 注册简单，无需手机号验证
• API 稳定，文档完善
• 支持群组和私聊
• 免费且无限制

创建步骤：
1. 在 Telegram 搜索 @BotFather
2. 发送 /newbot 创建机器人
3. 设置名称和用户名
4. 获取 API Token
5. 配置到 OpenClaw`,
      code: `# 停止当前服务
docker compose down

# 编辑配置文件，添加 Telegram Token
nano docker-compose.yml

# 找到这一行并取消注释，填入你的 Token：
# - TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# 保存后重新启动
docker compose up -d

# 查看日志，确认 Telegram 连接成功
docker compose logs -f openclaw | grep -i telegram

# 在 Telegram 中测试
# 1. 搜索你的机器人用户名
# 2. 点击 Start
# 3. 发送消息：/help 或 hello`
    },
    {
      title: '1.7 使用本地 Ollama 模型（可选）',
      content: `如果不想使用 OpenAI/Anthropic 付费 API，可以使用本地 Ollama。

优势：
• 完全免费
• 数据不出本地
• 支持多种开源模型

劣势：
• 需要较好的硬件（推荐 16GB+ 内存）
• 响应速度较慢
• 能力不如 GPT-4/Claude

推荐模型：
• llama3.2 - 轻量级，速度快
• mistral - 平衡性能和质量
• qwen2.5 - 中文支持好`,
      code: `# 如果 docker-compose.yml 中包含 ollama 服务
# 启动 Ollama
docker compose up -d ollama

# 进入 Ollama 容器
docker exec -it ollama bash

# 拉取模型（在容器内执行）
ollama pull llama3.2
# 或者
ollama pull mistral
ollama pull qwen2.5

# 测试模型
ollama run llama3.2
# 输入：Hello, who are you?
# 按 Ctrl+D 退出

# 退出容器
exit

# 重启 OpenClaw 使其连接到 Ollama
docker compose restart openclaw

# 查看日志
docker compose logs -f openclaw`
    },
    {
      title: '1.8 基础命令测试',
      content: `通过 Telegram 或 Web UI 测试 OpenClaw 的基本功能。

测试内容：
• 基础对话
• 系统信息查询
• 文件操作
• 命令执行

注意事项：
• 首次使用需要授权
• 某些命令需要管理员权限
• 注意安全，不要执行危险命令`,
      code: `# 在 Telegram 中测试以下命令：

# 1. 查看帮助
/help

# 2. 查看可用技能
/skills

# 3. 基础对话
你好，介绍一下自己

# 4. 系统信息（如果有权限）
查看当前目录的文件

# 5. 执行简单任务
帮我创建一个 hello.txt 文件，内容是 "Hello OpenClaw"

# 6. 查看状态
/status

# 7. 查看配置
/config

# 如果使用 Web UI，访问：
# http://localhost:3000
# 或在 Windows 浏览器中访问：
# http://localhost:3000`
    },
    {
      title: '1.9 常见问题排查',
      content: `遇到问题时的排查步骤。

常见问题：
1. 容器启动失败 - 检查端口占用、权限
2. 无法连接 Telegram - 检查 Token、网络
3. Ollama 连接失败 - 检查 host.docker.internal
4. 数据丢失 - 检查数据卷挂载

排查工具：
• docker compose logs - 查看日志
• docker compose ps - 查看状态
• docker inspect - 查看详细信息
• docker stats - 查看资源使用`,
      code: `# 查看所有容器日志
docker compose logs

# 查看特定服务日志（最近 100 行）
docker compose logs --tail=100 openclaw

# 实时跟踪日志
docker compose logs -f

# 查看容器详细信息
docker inspect openclaw

# 查看资源使用情况
docker stats openclaw

# 进入容器内部排查
docker exec -it openclaw sh

# 在容器内检查文件
ls -la /app/
cat /app/data/openclaw.db
exit

# 检查端口占用
netstat -tulpn | grep 3000

# 检查数据卷
docker volume ls
docker volume inspect openclaw_data

# 完全重置（删除所有数据）
docker compose down -v
rm -rf ~/openclaw/data/*
docker compose up -d`
    },
    {
      title: '1.10 下一步学习',
      content: `完成快速入门后，你可以继续深入学习。

第二章预告：核心架构理解
• 消息路由机制
• 会话管理原理
• 插件系统架构
• 工作流引擎

第三章预告：Docker 部署进阶
• 自定义 Dockerfile
• 多容器编排
• 生产环境配置
• 监控和日志

第四章预告：插件开发
• TypeScript 插件开发
• 自定义技能（Skills）
• 集成第三方 API
• 发布到 ClawHub

实践建议：
• 每天使用 OpenClaw 完成一个小任务
• 阅读官方文档和源码
• 加入社区交流（Discord/GitHub）
• 尝试开发自己的插件`,
      code: `# 保存当前配置
cd ~/openclaw
cp docker-compose.yml docker-compose.yml.backup

# 导出数据（备份）
tar -czf openclaw-backup-$(date +%Y%m%d).tar.gz data/

# 查看 OpenClaw 版本
docker exec openclaw cat /app/package.json | grep version

# 更新到最新版本
docker compose pull
docker compose up -d

# 查看更新日志
docker compose logs openclaw | head -50

# 探索更多功能
# 访问官方文档：https://openclaw.im/docs
# 查看示例：https://github.com/openclaw/openclaw/tree/main/examples`
    }
  ]
};
