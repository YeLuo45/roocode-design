# Roo Code Design

> Roo Code v3 架构设计文档站

## 项目简介

Roo Code 是 VS Code 上的 AI 编程助手插件（3M+ 安装），通过自然语言描述生成代码、调试、重构，支持 GPT-5.5、Claude Opus 4.7 等多模型。

**核心理念**：Your AI-Powered Dev Team, Right in Your Editor

## 文档结构

- [整体架构](./docs-site/architecture.md) — TypeScript Monorepo，src/core + packages 微内核
- [模式系统](./docs-site/modes.md) — Code/Architect/Ask/Debug/Custom Modes
- [上下文管理](./docs-site/context.md) — 智能上下文追踪与压缩
- [检查点机制](./docs-site/checkpoints.md) — Checkpoint 快照与回滚
- [MCP 集成](./docs-site/mcp.md) — Model Context Protocol 服务器集成
- [多语言支持](./docs-site/i18n.md) — 17+ 语言本地化
- [发布流程](./docs-site/release.md) — Changesets 版本管理与 CI/CD

## 在线访问

https://yeluo45.github.io/roocode-design/

## 技术栈

- VitePress — 文档渲染
- GitHub Actions — 自动构建部署
- GitHub Pages — 托管
