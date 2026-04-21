# Frontend Guidelines

返回总入口：[../AGENTS.md](../AGENTS.md)

## 技术栈
- React 19
- TypeScript 5
- Vite 7
- React Router 7
- Zustand
- Ant Design 6
- Tailwind CSS 4
- ESLint 9 + Prettier

## 目录结构
- `src/views/`：页面级功能，按业务模块拆分
- `src/components/`：通用组件与权限组件
- `src/router/`：路由配置
- `src/stores/`：全局状态
- `src/api/`、`src/utils/`：请求封装与工具函数
- `src/styles/`：全局样式与 Tailwind 入口

## 编码规范
- 遵循 `eslint.config.js` 与 `.prettierrc.json`
- 保持不加分号、单引号、单行宽度 `100`
- React 组件文件使用 `PascalCase`，hooks 使用 `useXxx`，工具文件使用小写语义名
- 页面逻辑尽量收敛在对应 `views/` 目录，不把业务状态散落到通用组件
- 请求统一走现有 `api` 或 `utils/request` 封装，不在页面内直接拼裸请求
- 新增权限相关 UI 时，优先复用现有守卫、按钮和菜单能力

## 工程约束
- 启动开发：`pnpm dev`
- 构建检查：`pnpm build`
- 提交前至少运行：`pnpm lint`
- 默认不提交 `dist/`、`node_modules/`、日志和本地环境文件
