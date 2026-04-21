# Repository Guidelines

## 文档入口
- 前端指南：[gfftz-frontend/AGENTS.md](gfftz-frontend/AGENTS.md)
- 后端指南：[gfftz-backend/AGENTS.md](gfftz-backend/AGENTS.md)

## 项目整体架构
本仓库是前后端分离项目，实际业务代码位于：

- 前端：`gfftz-frontend/`，基于 React + TypeScript + Vite，负责管理后台页面、路由、状态和权限展示。
- 后端：`gfftz-backend/`，基于 Go，按 `controller -> service -> dao -> models` 分层，提供 RBAC 相关 API、鉴权、中间件和数据访问能力。

协作原则：
- 页面、交互、状态管理变更优先落在 `gfftz-frontend/src/`
- 接口、鉴权、数据模型变更优先落在 `gfftz-backend/internal/`
- 前后端字段命名、分页参数、错误码语义保持一致

## 全局编码规范
- 优先复用现有目录和分层，不新增平行架构。
- 单次改动只处理一个明确问题，避免同时重构前后端无关代码。
- 命名以语义清晰为先：组件用 `PascalCase`，Go 包名用小写，文件名按职责命名。
- 不提交构建产物、日志、依赖目录、临时文件和敏感配置。
- 相对路径引用文档，避免绝对路径，保证仓库内可跳转。

## 全局忽略文件
仓库根目录当前没有统一 `.gitignore`，忽略规则主要在子项目内维护：

- 前端忽略文件：[gfftz-frontend/.gitignore](gfftz-frontend/.gitignore)
- 后端忽略文件：[gfftz-backend/.gitignore](gfftz-backend/.gitignore)

提交时默认忽略以下内容：
- 前端：`node_modules/`、`dist/`、日志文件、编辑器目录、`*.local`
- 后端：二进制产物、`tmp/`、`.air/`、日志、覆盖率文件、生产配置与本地环境文件

## 协作边界
- 修改前端实现前，先阅读 [gfftz-frontend/AGENTS.md](gfftz-frontend/AGENTS.md)
- 修改后端实现前，先阅读 [gfftz-backend/AGENTS.md](gfftz-backend/AGENTS.md)
- 涉及跨端联调时，以根文档为入口，再分别遵循子文档规则
