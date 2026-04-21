# Backend Guidelines

返回总入口：[../AGENTS.md](../AGENTS.md)

## 技术栈

- Go
- Gin 风格路由组织
- MySQL DAO 分层
- JWT 鉴权中间件
- Makefile 驱动开发、构建和测试
- Swagger/OpenAPI 文档与 `rest/` 请求样例

## 目录结构
- `main.go`：服务入口
- `internal/controller/`：HTTP 入口与响应封装
- `internal/service/`：业务逻辑
- `internal/dao/`：数据访问层
- `internal/models/`：请求、响应与领域模型
- `internal/middleware/`：鉴权与中间件
- `internal/router/`：路由注册
- `sql/`、`rest/`、`api-docs/`：初始化脚本、接口样例与文档

## API 规范
- 统一以 `/api` 为前缀，公开接口与受保护接口在路由分组中分开管理
- 鉴权接口放在 `/api/auth`，如登录、刷新令牌；业务接口默认经过 JWT 中间件
- 资源命名使用名词，如 `/user`、`/role`、`/resource`
- 查询、分页、批量操作保持现有风格，例如 `pagedList`、`batchDelete`、`toggleEnabled`
- 控制器只做参数接收、鉴权和响应封装；业务逻辑放在 `service`，数据库细节放在 `dao`
- 变更接口时同步更新 `api-docs/swagger.yaml` 或 `rest/` 示例

## 编码规范
- 保持 `gofmt` 输出，不手写与格式化结果冲突的风格
- 包名小写，文件名按职责命名，如 `user_service.go`、`auth_controller.go`
- 新增逻辑遵循现有分层，不在 controller 中直接操作数据库
- 错误处理、响应码和鉴权流程优先复用现有实现，避免生成新的并行规范

## 工程约束
- 本地运行：`make dev`
- 热重载：`make hot`
- 测试：`make test`
- 默认不提交二进制文件、`tmp/`、日志、覆盖率产物和敏感配置
