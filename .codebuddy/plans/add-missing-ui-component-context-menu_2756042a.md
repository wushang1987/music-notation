---
name: add-missing-ui-component-context-menu
overview: 安装缺失的 shadcn UI 组件 ContextMenu，修复 ScoreViewer.jsx 的导入错误。
todos:
  - id: explore-project-structure
    content: 使用 [subagent:code-explorer] 查找 ScoreViewer.jsx 及 UI 组件目录的确切位置
    status: completed
  - id: install-context-menu
    content: 运行 shadcn-ui CLI 命令安装 context-menu 组件
    status: completed
    dependencies:
      - explore-project-structure
  - id: verify-component-file
    content: 使用 [subagent:code-explorer] 确认 context-menu 相关文件已正确生成
    status: completed
    dependencies:
      - install-context-menu
  - id: fix-import-path
    content: 修改 ScoreViewer.jsx 中的导入路径以匹配新安装的组件
    status: completed
    dependencies:
      - verify-component-file
  - id: test-vite-build
    content: 运行 Vite 开发服务器验证导入错误是否已消除
    status: completed
    dependencies:
      - fix-import-path
  - id: check-ui-rendering
    content: 在浏览器中验证 ScoreViewer 的右键菜单交互功能
    status: completed
    dependencies:
      - test-vite-build
---

## 产品概述

本项目旨在修复音乐符号编辑工具中的 UI 组件缺失问题。由于在使用 shadcn/ui 过程中遗漏了 `context-menu` 组件，导致 `ScoreViewer.jsx` 在 Vite 环境下出现导入错误。

## 核心功能

- **安装 ContextMenu 组件**：通过 shadcn/ui 命令行工具安装缺失的右键菜单组件。
- **修复导入错误**：解决 `ScoreViewer.jsx` 中对 `../ui/context-menu` 的引用失败问题。
- **验证功能**：确保 ScoreViewer 中的右键菜单交互能够正常渲染且无控制台报错。

## 视觉效果

- 右键点击乐谱区域时，应弹出符合 shadcn/ui 风格的现代化、响应式右键菜单。
- 菜单具有平滑的进入动画、半透明背景模糊效果（取决于主题设置）以及清晰的选项布局。

## 技术栈 selection

- **UI 库**: shadcn/ui (基于 Radix UI 和 Tailwind CSS)
- **前端框架**: React
- **构建工具**: Vite
- **样式**: Tailwind CSS

## 实施详情

### 关键路径修复

由于 `ScoreViewer.jsx` 无法找到组件，修复重点在于恢复物理文件并确保路径别名（如 `@/components/ui/...`）正确解析。

### 核心代码结构

**ContextMenu 结构**:
基于 Radix UI 的组件封装，包含 `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem` 等导出项。

```typescript
// 预期导入方式
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
```

## 技术方案

1. **环境检查**：确认项目的 `components.json` 配置，确保 shadcn 执行路径正确。
2. **组件补全**：执行安装命令补全物理文件。
3. **逻辑校验**：对 `ScoreViewer.jsx` 进行静态检查，确认其使用的 API 与新安装的组件版本兼容。

## 代理扩展

### SubAgent

- **code-explorer**
- **目的**: 深入探索项目目录结构，精确定位 `ScoreViewer.jsx` 的物理路径及当前 `ui` 文件夹中的现有组件。
- **预期结果**: 提供准确的文件路径和当前的组件依赖清单，防止重复安装或路径配置错误。