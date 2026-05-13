import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Roo Code Design",
  description: "Roo Code v3 架构设计文档站",
  lang: "zh-CN",
  base: "/roocode-design/",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "首页", link: "/" },
      { text: "架构", link: "/architecture" },
      { text: "模式系统", link: "/modes" },
      { text: "上下文管理", link: "/context" },
      { text: "检查点", link: "/checkpoints" },
      { text: "MCP 集成", link: "/mcp" },
      { text: "多语言", link: "/i18n" },
      { text: "发布", link: "/release" },
    ],
    sidebar: [
      {
        text: "文档",
        items: [
          { text: "首页", link: "/" },
          { text: "整体架构", link: "/architecture" },
          { text: "模式系统", link: "/modes" },
          { text: "上下文管理", link: "/context" },
          { text: "检查点机制", link: "/checkpoints" },
          { text: "MCP 集成", link: "/mcp" },
          { text: "多语言支持", link: "/i18n" },
          { text: "发布流程", link: "/release" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/YeLuo45/roocode-design" },
    ],
    footer: {
      message: "基于 Roo Code v3 开源项目构建",
      copyright: "Copyright © 2025-present Roo Code Community",
    },
  },
});
