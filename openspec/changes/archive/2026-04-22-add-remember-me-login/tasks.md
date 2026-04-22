## 1. 前端登录交互

- [x] 1.1 在 `gfftz-frontend/src/views/SignIn/index.tsx` 登录表单中新增“7天免登录”勾选项，并设置明确的默认值
- [x] 1.2 更新前端登录请求类型与接口封装，使登录请求能够提交 `rememberMe` 字段
- [x] 1.3 更新用户状态管理逻辑，确保登录成功后现有 token 持久化与跳转流程不受影响

## 2. 后端认证策略

- [x] 2.1 扩展登录参数模型与登录控制器，支持接收 `rememberMe` 并为缺省值提供正常会话默认行为
- [x] 2.2 调整 JWT 签发逻辑，区分正常会话与 7 天免登录会话的 refresh token 生命周期
- [x] 2.3 扩展 refresh token claims 并更新刷新接口，使刷新后的 token 继续沿用原 remember-me 策略
- [x] 2.4 补充或调整认证相关配置项，明确正常会话与 remember-me 会话的 refresh token 时长

## 3. 接口样例与验证

- [x] 3.1 更新 `gfftz-backend/rest/auth.http` 等接口样例，体现 `rememberMe` 请求字段与预期使用方式
- [x] 3.2 验证未勾选 remember-me 时的登录、鉴权、自动刷新链路保持正常
- [x] 3.3 验证勾选 remember-me 时的登录、刷新续签与重新打开页面后的免登录体验符合 7 天策略
