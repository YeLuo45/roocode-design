# 检查点（Checkpoints）

## 概述

检查点（Checkpoint）功能允许用户保存 AI 对话状态的快照，并在对话历史中向前/向后导航。这是一个强大的版本控制机制，让用户能够在任意时刻保存工作状态，并在需要时恢复到之前的检查点。

> **v3.53.0 新功能**：Previous checkpoint navigation controls in chat — 在聊天界面中新增了检查点导航控制按钮。

## 核心概念

### 检查点（Checkpoint）

检查点是工作区文件状态的快照。每次保存检查点时，系统使用 Git 在后台创建一个提交，记录当前所有文件的状态。这允许用户：

1. 在任意时刻保存对话快照
2. 在对话中向前/向后导航
3. 恢复到之前的检查点状态
4. 查看任意两个检查点之间的文件差异

### 核心技术

检查点功能基于 **Shadow Git** 实现：
- 每个任务有独立的 Git 仓库（存储在全局存储目录中）
- 工作区目录作为 Git 工作树
- 每次保存检查点创建一个 Git 提交

## 主要文件结构

```
src/core/checkpoints/
└── index.ts          # 检查点核心模块

src/services/checkpoints/
├── index.ts                      # 服务入口
├── RepoPerTaskCheckpointService.ts # 按任务隔离的检查点服务
├── ShadowCheckpointService.ts     # 底层 Git 操作服务
├── types.ts                      # 类型定义
└── excludes.ts                   # 文件排除规则

src/core/webview/
└── checkpointRestoreHandler.ts   # 检查点恢复处理器
```

## API 参考

### src/core/checkpoints/index.ts

#### getCheckpointService(task, options)

获取或创建任务的检查点服务。

```typescript
async function getCheckpointService(
  task: Task, 
  { interval = 250 }: { interval?: number } = {}
): Promise<RepoPerTaskCheckpointService | undefined>
```

**参数**：
- `task` - 任务实例
- `interval` - 轮询间隔（毫秒）

**返回**：检查点服务实例或 `undefined`（当检查点被禁用时）

**前置条件**：
- 需要安装 Git
- 需要有工作区目录
- 需要有全局存储目录

#### checkpointSave(task, force?, suppressMessage?)

保存当前工作区状态为检查点。

```typescript
async function checkpointSave(
  task: Task, 
  force = false, 
  suppressMessage = false
): Promise<void>
```

**参数**：
- `force` - 是否允许空提交
- `suppressMessage` - 是否在聊天中隐藏检查点消息

#### checkpointRestore(task, options)

恢复到指定检查点。

```typescript
async function checkpointRestore(
  task: Task,
  { ts, commitHash, mode, operation }: CheckpointRestoreOptions
): Promise<void>

type CheckpointRestoreOptions = {
  ts: number           // 消息时间戳
  commitHash: string   // Git 提交哈希
  mode: "preview" | "restore"
  operation?: "delete" | "edit"
}
```

**模式**：
- `preview` - 仅预览，不修改消息
- `restore` - 实际恢复，会删除/编辑消息

**操作**：
- `delete` - 删除检查点之后的对话
- `edit` - 编辑检查点处的消息

#### checkpointDiff(task, options)

查看检查点之间的文件差异。

```typescript
async function checkpointDiff(
  task: Task,
  { ts, previousCommitHash, commitHash, mode }: CheckpointDiffOptions
): Promise<void>

type CheckpointDiffOptions = {
  ts?: number
  previousCommitHash?: string
  commitHash: string
  mode: "from-init" | "checkpoint" | "to-current" | "full"
}
```

**差异模式**：
- `from-init` - 从初始检查点到当前检查点
- `checkpoint` - 从当前检查点到下一个检查点
- `to-current` - 从检查点到当前工作区
- `full` - 从初始检查点到当前工作区

### src/services/checkpoints/types.ts

#### CheckpointResult

```typescript
type CheckpointResult = Partial<CommitResult> & Pick<CommitResult, "commit">
// 包含 commit 属性的 Git 提交结果
```

#### CheckpointDiff

```typescript
type CheckpointDiff = {
  paths: {
    relative: string   // 相对路径
    absolute: string  // 绝对路径
  }
  content: {
    before: string     // 变更前内容
    after: string      // 变更后内容
  }
}
```

#### CheckpointServiceOptions

```typescript
interface CheckpointServiceOptions {
  taskId: string          // 任务 ID
  workspaceDir: string    // 工作区目录
  shadowDir: string       // 阴影目录（全局存储）
  log?: (message: string) => void
}
```

#### CheckpointEventMap

```typescript
interface CheckpointEventMap {
  initialize: { 
    type: "initialize"
    workspaceDir: string
    baseHash: string
    created: boolean
    duration: number
  }
  checkpoint: {
    type: "checkpoint"
    fromHash: string
    toHash: string
    duration: number
    suppressMessage?: boolean
  }
  restore: { 
    type: "restore"
    commitHash: string
    duration: number
  }
  error: { 
    type: "error"
    error: Error
  }
}
```

### src/core/webview/checkpointRestoreHandler.ts

#### handleCheckpointRestoreOperation(config)

处理检查点恢复操作（删除或编辑）。

```typescript
async function handleCheckpointRestoreOperation(
  config: CheckpointRestoreConfig
): Promise<void>

interface CheckpointRestoreConfig {
  provider: ClineProvider
  currentCline: Task
  messageTs: number
  messageIndex: number
  checkpoint: { hash: string }
  operation: "delete" | "edit"
  editData?: {
    editedContent: string
    images?: string[]
    apiConversationHistoryIndex: number
  }
}
```

#### waitForClineInitialization(provider, timeoutMs?)

等待 Cline 初始化完成。

```typescript
async function waitForClineInitialization(
  provider: ClineProvider, 
  timeoutMs: number = 3000
): Promise<boolean>
```

## 工作流程

### 保存检查点

1. 调用 `checkpointSave(task)` 保存当前工作区状态
2. 检查点服务创建 Git 提交
3. 通过 `checkpoint` 事件通知 Webview 更新当前检查点哈希
4. 在聊天中显示检查点保存消息

### 恢复检查点

1. 用户选择要恢复的检查点
2. 调用 `handleCheckpointRestoreOperation()` 处理恢复
3. 调用 `checkpointRestore()` 执行实际恢复：
   - 在工作区执行 `git checkout <commit>`
   - 使用 `MessageManager.rewindToTimestamp()` 回滚对话消息
   - 取消当前任务并重新初始化
4. 对于删除操作：保存更新后的消息并重新创建任务
5. 对于编辑操作：处理待处理的编辑数据

### 查看差异

1. 用户选择比较模式
2. 调用 `checkpointDiff()` 获取变更列表
3. 使用 VS Code 的 `vscode.changes` 命令显示差异视图

## 事件流

```
[检查点服务] --checkpoint--> [Task] --postMessage--> [Webview]
                                     |
                                     v
                              [用户界面更新]
```

## 错误处理

- **Git 未安装**：显示警告消息并禁用检查点
- **工作区路径不存在**：禁用检查点
- **初始化超时**：发送警告消息给用户
- **恢复失败**：禁用该任务的检查点并记录日志

## 配置选项

检查点功能可通过以下任务配置控制：

- `enableCheckpoints` - 是否启用检查点
- `checkpointTimeout` - 初始化超时时间（秒）
- `checkpointServiceInitializing` - 服务是否正在初始化
