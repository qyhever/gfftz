## Why

当前仓库已经接入 OpenSpec 工作流，但缺少一个明确的中文样例变更来验证 proposal、design、specs、tasks 四类文档是否能稳定按简体中文生成。补上这个最小变更后，可以为后续中文协作提供基线，也能快速检查模板、说明和人工执行流程是否一致。

## What Changes

- 新增一个用于验证中文文档输出能力的 OpenSpec 变更样例。
- 为该样例补齐中文 proposal、design、spec 和 tasks 文档。
- 明确中文文档生成的范围、结构要求和最小验收标准，确保后续同类变更可复用。

## Capabilities

### New Capabilities
- `chinese-openspec-docs`: 为 OpenSpec 变更提供可校验的简体中文文档生成能力与统一结构约束

### Modified Capabilities

## Impact

- 变更目录：`openspec/changes/test-zh/`
- 新增规格文件：`openspec/changes/test-zh/specs/chinese-openspec-docs/spec.md`
- 不影响前端 `gfftz-frontend/`、后端 `gfftz-backend/` 的运行时代码、接口或数据模型
