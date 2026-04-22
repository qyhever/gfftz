## Context

本次变更不是业务功能开发，而是一次针对 OpenSpec 中文文档输出链路的最小验证。目标是确认在当前仓库约束下，proposal、design、specs、tasks 能够统一使用简体中文表达，并保持结构完整、术语稳定、可继续进入 apply 阶段。

现状约束如下：

- 仓库已启用 spec-driven schema，任务落地依赖 `proposal -> design/specs -> tasks` 的顺序。
- 根级与技能说明都要求所有 OpenSpec 产物使用简体中文。
- 当前仓库已有英文风格 spec 样例，但缺少一个明确面向中文输出验证的独立 capability。

## Goals / Non-Goals

**Goals:**

- 提供一个独立的中文 OpenSpec 样例变更，验证文档生成流程可用。
- 统一四类 artifact 的中文表达方式、结构层级和验收边界。
- 将“中文文档生成”约束收敛为可测试的 spec，避免只停留在口头约定。

**Non-Goals:**

- 不修改现有前后端业务代码。
- 不调整已有 `remember-me-login` capability 的需求定义。
- 不引入新的 CLI、模板系统或自动翻译脚本。

## Decisions

### 1. 以独立 capability 承载中文文档生成约束

本次变更新增 `chinese-openspec-docs` capability，而不是修改现有业务 capability。这样做的原因是该需求本质上是流程与文档规范验证，不属于已有登录能力的行为变更。

备选方案：

- 修改现有 capability：会把流程验证和业务需求混在一起，后续归档与追踪成本更高。

### 2. 使用最小闭环文档而不触发代码实现

本次只生成 proposal、design、specs、tasks 四类文档，不扩展到实际代码实现。这样可以把验证范围收敛在 OpenSpec 工作流本身，避免引入前后端实现噪音。

备选方案：

- 同时添加示例代码：能够扩大验证范围，但会把“文档生成”测试变成“文档加实现”的混合任务，不利于判断问题来源。

### 3. 在 spec 中把中文输出要求定义为 MUST 级约束

中文输出不是建议项，而是本仓库当前工作方式的一部分。因此在 spec 中使用 MUST/SHALL 语义，明确 proposal、design、tasks 的语言与结构要求，使该能力可验证、可追踪。

备选方案：

- 只在 AGENTS 或技能文档中说明：约束存在，但难以在 change 级别被显式检查。

## Risks / Trade-offs

- [风险] 该变更只验证文档生成，不验证自动化归档或实现阶段行为
  → 缓解：后续如需继续验证，可基于本变更直接进入 `/opsx:apply` 或新增归档测试

- [风险] 中文技术术语可能在不同 artifact 中出现不一致
  → 缓解：在文档中统一使用“proposal、design、specs、tasks、capability”等固定术语

- [风险] 这是一个流程样例，业务价值较弱
  → 缓解：将其定位为仓库中文协作基线，而不是业务功能交付

## Migration Plan

1. 创建 `test-zh` 变更目录并生成中文 proposal。
2. 基于 proposal 生成中文 design 与 spec。
3. 基于 design 与 spec 生成 tasks，满足 apply 阶段前置要求。
4. 运行状态检查，确认该变更已达到 apply-ready。

## Open Questions

- 后续是否需要把中文输出要求沉淀为仓库级共享 spec，而不是仅在示例 change 中体现。
- 是否需要增加 `openspec validate` 或自定义校验步骤，对中文 artifact 的存在性和结构进行自动检查。
