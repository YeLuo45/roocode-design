# Context Management（上下文管理）

Roo-Code 的上下文管理系统负责智能管理和优化与 LLM 对话时的上下文大小。当对话接近 token 限制时，系统会自动采取策略来腾出空间，同时保留关键的上下文信息。

## 核心概念

### 1. 上下文追踪（Context Tracking）

**文件：** `src/core/context-tracking/FileContextTracker.ts`

智能追踪代码库中的文件变化，防止因外部修改导致的过期上下文问题。

**核心功能：**
- 追踪文件读取操作（通过工具或 @ 提及）
- 检测外部修改：当文件在 Roo 外部被修改时自动追踪
- 区分 Roo 编辑和用户编辑
- 为检查点服务提供可能需要保存的文件列表

**追踪来源（RecordSource）：**
- `read_tool` — 通过工具读取文件
- `file_mentioned` — 通过 @ 提及引用文件
- `roo_edited` — Roo 编辑了文件
- `user_edited` — 用户在 Roo 外部编辑了文件

```typescript
// 追踪文件操作
await fileContextTracker.trackFileContext(filePath, "file_mentioned")

// 获取最近修改的文件（供检查点使用）
const modifiedFiles = fileContextTracker.getAndClearRecentlyModifiedFiles()

// 获取 Roo 读取过的文件列表（用于折叠上下文）
const filesReadByRoo = await fileContextTracker.getFilesReadByRoo()
```

---

### 2. 上下文压缩（Context Condensing）

**文件：** `src/core/condense/index.ts`

使用 LLM 智能摘要对话历史，采用"全新开始"（Fresh Start）模型。

**压缩策略：**
- **Fresh Start 模型：** 摘要成为一条用户消息，模型只看到摘要
- **非破坏性压缩：** 所有原始消息标记 `condenseParent`，仍保留在存储中
- **工作流保留：** `<command>` 块中的活动工作流在多次压缩中保持连续
- **代码上下文折叠：** 可以保留读取过的文件代码定义（通过 tree-sitter）

**触发阈值：**
- `MIN_CONDENSE_THRESHOLD = 5` — 最小触发百分比
- `MAX_CONDENSE_THRESHOLD = 100` — 最大触发百分比
- 默认 `autoCondenseContextPercent` 由用户配置

**工具块转换：**
将 `tool_use` 和 `tool_result` 块转换为文本表示，使其可以在摘要请求中发送而不需要 `tools` 参数。

```typescript
// 摘要对话
const result = await summarizeConversation({
    messages,
    apiHandler,
    systemPrompt,
    taskId,
    isAutomaticTrigger: true,
    filesReadByRoo,
    cwd,
    rooIgnoreController,
})
```

---

### 3. 滑动窗口截断（Sliding Window Truncation）

**文件：** `src/core/context-management/index.ts`

当压缩不可用或失败时的后备策略。

**特点：**
- 非破坏性：消息标记为隐藏而非删除
- 保留第一条消息（通常是初始任务）
- 隐藏的消息数向下取整为偶数
- 插入截断标记：`[Sliding window truncation: N messages hidden]`
- 支持回滚：用户可以回滚到截断点之前的消息

```typescript
// 截断对话
const result = truncateConversation(messages, 0.5, taskId)
// 返回 { messages, truncationId, messagesRemoved }
```

---

### 4. 上下文保护（Protect）

**文件：** `src/core/protect/RooProtectedController.ts`

保护敏感的 Roo 配置文件，防止被自动批准修改。

**受保护的文件模式：**
```
.rooignore        — 忽略规则
.roomodes         — 模式配置
.roorules*        — Roo 规则文件
.clinerules*      — Cline 规则文件
.roo/**           — Roo 目录
.vscode/**        — VS Code 配置
*.code-workspace  — VS Code 工作区
.rooprotected     — 预留
AGENTS.md / AGENT.md — Agent 配置
```

**功能：**
```typescript
// 检查文件是否受保护
const isProtected = controller.isWriteProtected(filePath)

// 获取受保护文件列表
const protectedFiles = controller.getProtectedFiles(paths)

// 获取 LLM 说明
const instructions = controller.getInstructions()
// 输出: # Protected Files\n\n(Protected patterns: .rooignore, .roomodes, ...)
```

---

### 5. 上下文提及（Mentions）

**文件：** `src/core/mentions/index.ts`

解析和处理用户内容中的 `@` 提及引用。

**支持的提及类型：**
| 类型 | 语法 | 说明 |
|------|------|------|
| 文件 | `@/path/to/file` | 读取文件内容 |
| 文件夹 | `@/path/to/folder/` | 列出目录内容 |
| URL | `@https://...` | 打开外部链接 |
| Problems | `@problems` | 工作区诊断信息 |
| Git Changes | `@git-changes` | 当前工作目录变更 |
| Git Commit | `@abc123def` | 特定提交信息 |
| Terminal | `@terminal` | 终端输出 |
| Command | `@/command-name` | Roo 命令内容 |

**处理流程：**
1. 解析用户文本中的提及语法
2. 验证命令/技能是否存在
3. 读取引用的文件/文件夹内容
4. 将内容格式化为类似 `read_file` 工具结果
5. 返回文本引用和内容块分离的结果

```typescript
const result = await parseMentions(text, cwd, fileContextTracker, rooIgnoreController)
// 返回 { text, contentBlocks, slashCommandHelp, mode }
```

**特殊处理：**
- 二进制文件不会包含图像内容作为文本上下文
- 被忽略的文件显示为 `[read_file for 'path']\nNote: File is ignored by .rooignore.`
- 文件截断时显示行数信息和读取更多内容的指导

---

### 6. 忽略规则（Ignore）

**文件：** `src/core/ignore/RooIgnoreController.ts`

通过 `.rooignore` 文件控制 LLM 可以访问的文件。

**功能：**
```typescript
// 验证文件访问权限
const canAccess = controller.validateAccess(filePath)

// 过滤路径数组
const allowedPaths = controller.filterPaths(paths)

// 验证终端命令访问的文件
const blockedFile = controller.validateCommand("cat secret.txt")
// 返回: 文件路径（如果被阻止）或 undefined（如果允许）

// 获取 LLM 说明
const instructions = controller.getInstructions()
// 仅当 .rooignore 存在时返回
```

**特点：**
- 使用 `ignore` 库支持标准 `.gitignore` 语法
- 自动解析符号链接
- 文件监视器自动重新加载 `.rooignore` 变化
- `.rooignore` 本身始终被允许访问

**示例 `.rooignore`：**
```
# 忽略 node_modules
node_modules/

# 忽略所有日志文件
*.log

# 忽略特定目录
dist/
build/
```

---

### 7. 检查点管理（Checkpoints）

**文件：** `src/core/checkpoints/index.ts`

为任务状态提供保存和恢复能力。

**功能：**
```typescript
// 保存检查点
await checkpointSave(task, force, suppressMessage)

// 恢复检查点
await checkpointRestore(task, {
    ts: messageTimestamp,
    commitHash: "abc123",
    mode: "restore" // 或 "preview"
})

// 查看差异
await checkpointDiff(task, {
    commitHash: "abc123",
    mode: "checkpoint" // 或 "from-init", "to-current", "full"
})
```

**特性：**
- 基于 Git 的影子提交（Shadow Git）实现
- 每个任务独立的检查点服务
- 支持空检查点强制保存
- 检查点可以抑制消息显示

---

## 上下文管理流程

```
用户发送消息
     │
     ▼
┌─────────────────────────┐
│ 计算上下文 token 使用量   │
└─────────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ 是否达到压缩阈值？        │
│ autoCondenseContextPercent
└─────────────────────────┘
     │
    是│                    │否
     ▼                     │
┌─────────────────┐        │
│ 尝试上下文压缩    │        │
│ summarizeConversation    │
└─────────────────┘        │
     │                     │
 成功│                     │
     ▼                     │
┌─────────────────┐        │
│ 保留摘要和工作流  │        │
│ 标记原消息为隐藏  │        │
└─────────────────┘        │
     │
     ▼
┌─────────────────────────┐
│ Token 仍超过允许值？      │
└─────────────────────────┘
     │
    是│
     ▼
┌─────────────────┐
│ 滑动窗口截断     │
│ 隐藏 50% 消息   │
└─────────────────┘
```

---

## 事件类型

**文件：** `packages/types/src/context-management.ts`

```typescript
export const CONTEXT_MANAGEMENT_EVENTS = [
    "condense_context",         // 上下文压缩完成
    "condense_context_error",   // 压缩过程中出错
    "sliding_window_truncation", // 滑动窗口截断执行
]
```

---

## 相关文件索引

| 模块 | 文件路径 | 说明 |
|------|----------|------|
| Context Management | `src/core/context-management/index.ts` | 主管理逻辑 |
| Condense | `src/core/condense/index.ts` | 对话摘要 |
| Condense | `src/core/condense/foldedFileContext.ts` | 代码折叠 |
| Tracking | `src/core/context-tracking/FileContextTracker.ts` | 文件追踪 |
| Protect | `src/core/protect/RooProtectedController.ts` | 写保护 |
| Mentions | `src/core/mentions/index.ts` | @ 提及解析 |
| Mentions | `src/core/mentions/processUserContentMentions.ts` | 提及处理 |
| Ignore | `src/core/ignore/RooIgnoreController.ts` | 忽略规则 |
| Checkpoints | `src/core/checkpoints/index.ts` | 检查点管理 |
| Types | `packages/types/src/context-management.ts` | 类型定义 |
