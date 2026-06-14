# Docker Volume 完全指南

## 📚 Volume vs Bind Mount 对比

| 特性 | Bind Mount | Named Volume |
|------|-----------|--------------|
| 路径 | 宿主机绝对路径 | Docker 管理的路径 |
| 性能 | 较慢（特别是 Mac/Windows） | 更快 |
| 可移植性 | 差（依赖宿主机路径） | 好（Docker 管理） |
| 备份 | 需要手动备份目录 | 使用 Docker 命令备份 |
| 适用场景 | 开发环境、需要实时同步 | 生产环境、数据持久化 |
| 权限问题 | 可能有权限冲突 | Docker 自动管理 |

---

## 🎯 三种部署方式详解

### 方式一：Bind Mount（开发环境推荐）

**特点：** 直接挂载宿主机目录，代码修改实时生效

```bash
# 启动
docker-compose --profile dev up -d

# 更新代码
npm run build
docker-compose --profile dev restart

# 停止
docker-compose --profile dev down
```

**优点：**
- 代码更新后只需重新构建，无需复制文件
- 适合频繁修改的开发环境

**缺点：**
- 性能较差（特别是 Mac/Windows）
- 依赖宿主机目录结构

---

#