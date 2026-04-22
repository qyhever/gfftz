## Why

当前系统虽然已经具备 `accessToken + refreshToken` 的续签机制，但“7天免登录”还不是一个明确、可控的产品能力。登录页没有对应入口，后端也无法根据用户选择区分短会话和长会话，导致需求只能通过统一调整 token 生命周期来间接实现，既不利于产品表达，也不利于安全策略控制。

## What Changes

- 在登录页新增“7天免登录”勾选项，作为显式登录选项提交给后端。
- 扩展登录接口请求参数，支持 `rememberMe` 布尔字段。
- 调整后端令牌签发策略：未勾选时签发短会话 refresh token，勾选时签发 7 天有效期 refresh token。
- 调整刷新令牌流程，确保刷新后继续沿用原会话的“是否免登录”策略，而不是在刷新时丢失。
- 补充接口样例和变更说明，明确该能力基于 refresh token 生命周期，而不是改成长效 access token 或切换为 cookie 会话。

## Capabilities

### New Capabilities
- `remember-me-login`: 为账号密码登录提供显式的“7天免登录”能力，并在令牌刷新过程中保持一致的会话策略

### Modified Capabilities

## Impact

- 前端登录页与用户状态管理：`gfftz-frontend/src/views/SignIn/`、`gfftz-frontend/src/api/global.ts`、`gfftz-frontend/src/stores/user.ts`
- 前端请求刷新链路：`gfftz-frontend/src/utils/request.ts`
- 后端登录与刷新接口：`gfftz-backend/internal/controller/auth_controller.go`
- 后端登录参数模型与 JWT 签发逻辑：`gfftz-backend/internal/models/`、`gfftz-backend/internal/pkg/jwt/jwt.go`
- 接口样例与说明文档：`gfftz-backend/rest/auth.http` 及相关接口文档
