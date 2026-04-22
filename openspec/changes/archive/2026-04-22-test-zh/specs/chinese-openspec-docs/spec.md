## ADDED Requirements

### Requirement: OpenSpec 变更文档 MUST 支持简体中文输出
系统 MUST 允许变更提案的核心 artifact 使用简体中文编写，包括 proposal、design、specs 和 tasks，以满足当前仓库的协作约束。

#### Scenario: 创建中文 proposal
- **WHEN** 用户为一个新变更提供中文需求描述
- **THEN** 系统 MUST 能生成结构完整且内容为简体中文的 proposal 文档

#### Scenario: 创建中文设计与任务文档
- **WHEN** proposal 已经定义完能力范围
- **THEN** 系统 MUST 能继续生成简体中文的 design、specs 和 tasks 文档

### Requirement: 中文 artifact MUST 保持统一结构
每个中文 artifact MUST 继续遵循当前 schema 的既定结构，而不能因为切换语言而省略关键章节或改变层级。

#### Scenario: proposal 保留标准章节
- **WHEN** 系统生成中文 proposal
- **THEN** proposal MUST 包含 Why、What Changes、Capabilities 和 Impact 章节

#### Scenario: tasks 保持可追踪复选框格式
- **WHEN** 系统生成中文 tasks
- **THEN** tasks 文档 MUST 使用 `- [ ]` 复选框格式并按编号分组

### Requirement: 中文 capability 定义 MUST 可进入 apply 阶段
当一个中文变更完成 proposal、design、specs 和 tasks 后，该变更 MUST 满足进入 apply 阶段所需的前置文档条件。

#### Scenario: tasks 完成后变更可继续推进
- **WHEN** 中文变更所需 artifact 已全部生成
- **THEN** 该变更 MUST 在状态检查中显示 tasks 已完成，从而可继续进入实现阶段

#### Scenario: 中文 spec 可作为验收依据
- **WHEN** 后续实现者阅读该变更的 spec 与 tasks
- **THEN** 他们 MUST 能基于中文要求理解交付范围与验收边界
