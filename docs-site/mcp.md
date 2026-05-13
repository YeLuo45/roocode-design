# MCP (Model Context Protocol) 集成

Roo Code 通过 MCP (Model Context Protocol) 支持连接外部 MCP Servers，从而扩展 AI 的能力范围。MCP 是一种标准协议，允许 AI 助手与各种外部工具和服务进行交互。

## 概述

Roo Code 的 MCP 集成由以下核心组件实现：

- **McpServerManager** (`src/services/mcp/McpServerManager`) - MCP 服务器管理器，负责服务器的启动、停止和生命周期管理
- **McpHub** (`src/services/mcp/McpHub`) - MCP 中心枢纽，处理与各个 MCP 服务器的通信

## 核心功能

### MCP 服务器配置

Roo Code 通过 `mcp_settings.json` 文件管理 MCP 服务器配置。配置文件位于用户设置目录，包含以下结构：

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

### MCP 权限组

在自定义模式 (Custom Modes) 中，`mcp` 是一个独立的权限组。Mode Groups 支持的权限包括：

- `read` - 读取文件权限
- `edit` - 编辑文件权限
- `command` - 执行命令权限
- `mcp` - MCP 工具权限
- `modes` - 模式切换权限
- `browser` - 浏览器操作权限

```yaml
groups:
  - mcp  # MCP 工具权限
```

## MCP 工具类型

Roo Code 通过 MCP 集成了多种工具类型，包括：

### 文件操作工具
通过 MCP 服务器访问文件系统，执行读取、写入、删除等操作。

### 命令执行工具
通过 MCP 协议执行系统命令和脚本。

### 搜索工具
提供代码库搜索和内容查找功能。

### Git 操作工具
通过 MCP 服务器集成 Git 功能，如提交、分支管理等。

### Web/搜索工具
通过 MCP 连接外部 Web 服务和 API，扩展 AI 的信息获取能力。

## 目录结构

```
src/
├── services/
│   └── mcp/
│       ├── McpServerManager.ts  # 服务器管理器
│       └── McpHub.ts            # MCP 中心枢纽
├── core/
│   └── tools/                   # 工具注册，MCP 工具在此注册
├── integrations/                # 集成层
└── __mocks__/fs/promises.ts     # 包含 MCP 配置的模拟数据
```

## 配置迁移

Roo Code 支持从旧版配置迁移 MCP 设置：

- 旧文件名: `cline_mcp_settings.json`
- 新文件名: `mcp_settings.json`

迁移过程由 `src/utils/migrateSettings.ts` 自动处理。

## 关键词

在 `package.json` 中，MCP 相关关键词包括：

- `mcp`
- `cline`
- `claude`
- `dev`
- `openrouter`
- `coding`
- `agent`
- `autonomous`
- `ai`

## 使用场景

通过 MCP 集成，Roo Code 可以：

1. 连接外部工具和服务，扩展 AI 能力
2. 与文件系统、Git、Web API 等外部系统交互
3. 通过自定义 MCP 服务器实现特定功能
4. 在不同的工作模式中灵活使用 MCP 工具

## 相关资源

- [Roo Code 官方网站](https://roocode.com)
- [MCP 协议文档](https://modelcontextprotocol.io)
- [Discord 社区](https://discord.gg/roocode)
