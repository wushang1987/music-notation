---
name: fix-missing-button-import
overview: 在 VerovioEditor.jsx 中正确引入 shadcn Button 组件，修复运行时的 ReferenceError。
todos:
  - id: audit-button-usage
    content: 使用[subagent:code-explorer]审查 VerovioEditor.jsx 里 Button 的调用与缺失导入
    status: completed
  - id: add-button-import
    content: 在 VerovioEditor.jsx 顶部补充 shadcn Button 导入
    status: completed
    dependencies:
      - audit-button-usage
  - id: verify-editor-ui
    content: 本地运行编辑器确认按钮渲染与交互正常
    status: completed
    dependencies:
      - add-button-import
---

## Product Overview

Verovio 交互编辑器需要在按钮操作区保持一致的交互体验，确保运行时无错误并展示统一风格的行动按钮。

## Core Features

- **按钮交互稳定展示**：保证编辑器中的操作按钮正常渲染与响应点击，保持与其余控件一致的视觉风格与交互反馈。

## Tech Stack

- 前端：现有 React JSX 代码基，沿用 shadcn UI 组件体系
- 构建：复用项目既有打包与依赖管理流程

## Implementation Details

### Module Focus

- **VerovioEditor 视图模块**：负责渲染乐谱画布和控制按钮；依赖 shadcn Button 组件。

### Core Directory Structure

```
music-notation/
└── src/
    └── components/
        └── VerovioEditor.jsx   # 修复 Button 引入
```

### Key Code Structures

```
import { Button } from "@/components/ui/button";

<Button variant="secondary" onClick={handleReset}>
  Reset
</Button>
```

### Technical Implementation Plan

1. **问题**：VerovioEditor.jsx 中引用 &lt;Button&gt; 但未导入。

- **方案**：定位文件顶部并补充与项目路径匹配的 shadcn Button 引入。
- **步骤**：a) 检查组件路径；b) 添加 import；c) 保存并运行单元/手动测试。
- **测试**：启动开发服务器，确认无 ReferenceError 且按钮样式正确。

2. **验证**：确保 Button 的 variant/size 等 props 与 shadcn 版本匹配。

- **方案**：对照项目 UI 规范，必要时调整 props。
- **测试**：UI 目测与交互点击确认。

### SubAgent

- **code-explorer**
- **Purpose**: 遍历并确认 VerovioEditor.jsx 的 Button 使用场景与现有导入情况
- **Expected outcome**: 清晰列出需要补充导入的文件位置与上下文