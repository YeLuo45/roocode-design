# Roo Code 发布系统

Roo Code 使用 [Changesets](https://github.com/changesets/changesets) 进行语义化版本管理和自动化发布。

## 概述

Changesets 是一个用于管理版本变更和生成 CHANGELOG 的工具，支持语义化版本（SemVer）和多包管理。

## 核心文件

### .changeset 目录

| 文件 | 说明 |
|------|------|
| `config.json` | Changesets 配置文件 |
| `changelog-config.js` | Changelog 生成规则配置 |

### 配置文件

**config.json** — Changesets 主配置：

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.4/schema.json",
  "changelog": "./changelog-config.js",
  "commit": false,
  "fixed": [["roo-cline"]],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@roo-code/cli"]
}
```

关键配置项说明：

- **fixed**: 固定包分组，这里 `roo-cline` 是主包
- **access**: `restricted` 表示私有访问（需 npm token）
- **baseBranch**: 主分支为 `main`
- **ignore**: 忽略 `@roo-code/cli` 包的变化

**changelog-config.js** — Changelog 生成逻辑：

```javascript
const getReleaseLine = async (changeset) => {
  const lines = changeset.summary
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.map((line) => (line.startsWith("- ") ? line : `- ${line}`)).join("\n")
}

const getDependencyReleaseLine = async () => {
  return ""
}

const changelogFunctions = {
  getReleaseLine,
  getDependencyReleaseLine,
}

module.exports = changelogFunctions
```

## 版本规范

基于 [Conventional Commits](https://www.conventionalcommits.org/)：

- **major**: 不兼容的 API 变更
- **minor**: 向后兼容的新功能
- **patch**: 向后兼容的修复

Changesets 会根据提交的 changeset 文件自动确定版本级别。

## 发布流程

### 发布命令（.roo/commands/release.md）

```markdown
1. Identify the SHA corresponding to the most recent release using GitHub CLI
2. Analyze changes since the last release
3. For each PR with linked issues, fetch the issue details
4. Summarize the changes and determine version type (major/minor/patch)
5. Create a changeset in .changeset/v[version].md
6. Generate release image if available
7. Update announcement files for major/minor releases
8. Create release branch and commit
9. Create pull request for release preparation
10. GitHub Actions workflow handles automatic publishing
```

### Changeset 文件格式

```
---
"roo-cline": patch|minor|major
---

[list of changes]
```

示例：

```markdown
---
"roo-cline": minor
---

- Add GPT-5.5 support via the OpenAI Codex provider (PR #12170 by @hannesrudolph)
- Fix memory leak in extension (#456 by @issueReporter, PR #789 by @contributor)
```

### Changeset 编写规范

- **必须包含**：每个 PR 都必须包含在 changeset 中
- **格式**：`类型: 描述 (PR #XXX by @username)`
- **Issue 关联**：`Fix: Description (#123 by @reporter, PR #456 by @author)`
- **排序**：从重要到次要排序

## 发布类型

### Pre-release

预发布版本用于测试，格式为 `X.Y.Z-alpha.1` 或 `X.Y.Z-beta.1`。

### 正式发布

正式发布流程：

1. **创建 Changeset** → 在 `.changeset/` 目录创建版本文件
2. **提交 PR** → 创建 `release/v[x.y.z]` 分支并提交 PR
3. **合并到 main** → GitHub Actions 自动创建版本 bump PR
4. **合并版本 PR** → 自动更新 CHANGELOG.md 和发布

## GitHub Actions 自动化

发布流程完全自动化：

- 当 changesets 合并到 `main` 分支时触发
- 自动创建版本 bump PR
- 自动更新 `CHANGELOG.md`
- 合并版本 PR 时自动发布到 npm

## CHANGELOG 示例

```markdown
# Roo Code Changelog

## 3.53.0

### Minor Changes

- Add GPT-5.5 support via the OpenAI Codex provider (PR #12170 by @hannesrudolph)
- Add Claude Opus 4.7 support on Vertex AI (#12134 by @saneroen, PR #12135 by @saneroen)

## 3.52.1

### Patch Changes

- Add correct JSON schema for `.roomodes` configuration files (#11790 by @algorhythm85, PR #11791 by @app/roomote-v0)
```

## 相关资源

- [Changesets 官方文档](https://github.com/changesets/changesets)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [Roo Code GitHub Releases](https://github.com/Roo-Cline/releases)
