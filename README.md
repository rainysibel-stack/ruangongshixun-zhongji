# 小小美食家 (Little Gourmet)

这是一个基于 Node.js + Express + MySQL + Vue 3 + UnoCSS 的智能食谱管理系统。

## 项目结构

- `client/`: Vue 3 前端项目 (Vite + Pinia + Vue Router + UnoCSS)
- `server/`: Node.js 后端 API 服务
- `old_html_demo/`: 旧的 HTML 演示文件（已归档）
- `docker-compose.yml`: 数据库 Docker 配置文件
- `init.sql`: 数据库初始化脚本

## 快速开始

### 1. 启动数据库

确保你已经安装了 Docker Desktop。在项目根目录下运行：

```bash
docker-compose up -d
```

这将启动 MySQL 容器并自动执行 `init.sql` 初始化数据库表结构。

### 2. 启动后端服务

打开一个新的终端窗口：

```bash
cd server
npm install
npm run dev
```

后端服务将在 `http://localhost:3000` 启动。

### 3. 启动前端应用

打开另一个新的终端窗口：

```bash
cd client
npm install
npm run dev
```

前端应用通常会在 `http://localhost:5173` 启动（具体看控制台输出）。

## 默认配置

- **数据库端口**: 3307 (映射到主机的 3307 端口，避免与本地 MySQL 3306 冲突)
- **数据库用户**: user / password
- **数据库名**: little_gourmet
- **后端端口**: 3000

## 技术栈

- **前端**: Vue 3, TypeScript, Vite, Pinia, Vue Router, UnoCSS, Lucide Vue
- **后端**: Node.js, Express, Sequelize, MySQL
- **认证**: JWT

## 功能模块

1.  **用户系统**: 注册、登录、个人中心 (修改昵称)、游客模式
2.  **食谱管理**: 查看详情 (步骤/营养/小贴士)、创建、分类筛选、收藏、烹饪打卡
3.  **冰箱管理**: 添加食材、自动分类、列表/分类视图切换
4.  **智能推荐**: 
    - **精准模式**: 100% 食材匹配
    - **创意模式**: 允许部分食材缺失
    - **惊喜模式**: 随机推荐 + 优选
5.  **采购清单**: 添加采购项、一键移入冰箱

## 演示数据

系统内置了演示账号，可直接点击登录页面的 "游客体验模式" 登录，或使用以下账号：
- **用户名**: demo
- **密码**: 123456
