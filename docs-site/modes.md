# Roo Code 模式（Modes）

Roo Code 适配你的工作方式，提供多种专业模式来处理不同的开发任务。

## 内置模式

### 1. Code Mode（代码模式）

用于日常编码、文件编辑和操作任务。

**适用场景：**
- 编写和修改代码
- 文件操作（创建、删除、重命名）
- 重构现有代码
- 生成新功能实现

---

### 2. Architect Mode（架构模式）

用于规划系统、编写规格说明和制定迁移方案。

**适用场景：**
- 系统架构设计
- 编写技术规格文档
- 制定迁移计划
- 技术决策分析

---

### 3. Ask Mode（问答模式）

用于快速获取答案、代码解释和文档查阅。

**适用场景：**
- 代码库相关问题解答
- 解释现有代码逻辑
- 查阅和总结文档
- 快速技术咨询

---

### 4. Debug Mode（调试模式）

用于追踪问题、添加日志和定位根本原因。

**适用场景：**
- 追踪 bug 和问题
- 添加调试日志
- 分析错误堆栈
- 隔离和定位根本原因

---

### 5. Custom Modes（自定义模式）

为团队或工作流程构建专用模式。

**适用场景：**
- 团队特定工作流程自动化
- 领域专用工具集成
- 定制化开发流程

---

## 自定义模式示例

Roo Code 支持通过 `.roomodes` 文件定义自定义模式。以下是一些示例：

### 🌐 Translate（翻译模式）

翻译和本地化管理。

- **slug:** `translate`
- **groups:** `read`, `command`, `edit`（限 md/ts/tsx/js/jsx/json 文件）

### 🔧 Issue Fixer（Issue 修复器）

GitHub issue 修复和功能实现。

- **slug:** `issue-fixer`
- **groups:** `read`, `edit`, `command`

### 🛠️ PR Fixer（PR 修复器）

修复 pull request 问题。

- **slug:** `pr-fixer`
- **groups:** `read`, `edit`, `command`, `mcp`

### 🔀 Merge Resolver（合并解决器）

使用 git 历史智能解决合并冲突。

- **slug:** `merge-resolver`
- **groups:** `read`, `edit`, `command`, `mcp`

### 📚 Docs Extractor（文档提取器）

从代码库提取信息或验证文档准确性。

- **slug:** `docs-extractor`
- **groups:** `read`, `edit`（限 `.roo/extraction/` 目录）, `command`, `mcp`

### 🕵️ Issue Investigator（Issue 调查器）

调查 GitHub issue 并分析根本原因。

- **slug:** `issue-investigator`
- **groups:** `read`, `command`, `mcp`

### 📝 Issue Writer（Issue 编写器）

创建结构良好的 GitHub issue。

- **slug:** `issue-writer`
- **groups:** `read`, `command`, `mcp`

---

## 模式配置结构

自定义模式通过 YAML 配置定义：

```yaml
customModes:
  - slug: translate
    name: 🌐 Translate
    roleDefinition: 你是 Roo，一个专注于翻译和本地化管理...
    whenToUse: 翻译和管理本地化文件时使用。
    description: 翻译和本地化管理
    groups:
      - read
      - command
      - edit
        - fileRegex: (.*\.(md|ts|tsx|js|jsx)$|.*\.json$)
          description: 源代码、翻译文件和文档
    source: project
```

---

## Mode Groups（权限控制）

Mode Groups 用于控制模式对系统资源的访问权限：

| Group | 权限说明 |
|-------|---------|
| `read` | 文件读取权限 |
| `edit` | 文件编辑权限 |
| `command` | 命令执行权限 |
| `mcp` | MCP 工具调用权限 |

### 细粒度权限控制

`edit` 权限可以限制为特定文件类型：

```yaml
groups:
  - read
  - edit
    - fileRegex: \.md$
      description: 仅允许编辑 Markdown 文件
  - command
```

---

## 相关资源

- [使用模式](https://docs.roocode.com/basic-usage/using-modes)
- [自定义模式](https://docs.roocode.com/advanced-usage/custom-modes)
- [官方文档](https://docs.roocode.com)
