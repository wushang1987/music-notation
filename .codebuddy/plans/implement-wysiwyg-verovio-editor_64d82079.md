---
name: implement-wysiwyg-verovio-editor
overview: 将 Verovio 编辑器从“代码驱动”升级为“可视化驱动（WYSIWYG）”，提供类似 Word 的点击编辑、视觉工具栏和上下文菜单，隐藏复杂的 MEI XML 源码。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - WYSIWYG
    - Glassmorphism
    - Clean UI
    - Interactive SVG
  fontSystem:
    fontFamily: Inter
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 16px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#2563EB"
      - "#1D4ED8"
    background:
      - "#F8FAFC"
      - "#FFFFFF"
    text:
      - "#0F172A"
      - "#64748B"
    functional:
      - "#EF4444"
      - "#10B981"
      - "#F59E0B"
todos:
  - id: explore-codebase
    content: 使用 [subagent:code-explorer] 调研现有 Verovio 渲染逻辑与 Monaco 同步机制
    status: completed
  - id: svg-event-mapping
    content: 实现 SVG 元素点击捕获与 MEI ID 的映射逻辑
    status: completed
    dependencies:
      - explore-codebase
  - id: selection-state
    content: 开发选中元素的高亮视觉效果与状态管理
    status: completed
    dependencies:
      - svg-event-mapping
  - id: visual-toolbar
    content: 使用 shadcn 创建浮动工具栏并集成基本音符操作
    status: completed
    dependencies:
      - selection-state
  - id: context-menu
    content: 实现基于选中元素的动态右键上下文菜单
    status: completed
    dependencies:
      - selection-state
  - id: verovio-edit-commands
    content: 集成 Verovio 编辑指令以支持实时修改 MEI 源码
    status: completed
    dependencies:
      - visual-toolbar
      - context-menu
  - id: sync-preview
    content: 优化异步渲染流程，确保可视化编辑与源码双向无缝同步
    status: completed
    dependencies:
      - verovio-edit-commands
---

## 产品概述

将 Verovio 乐谱编辑器从基于代码（MEI XML）的编辑模式升级为可视化（WYSIWYG）交互模式。用户可以直接在生成的 SVG 乐谱上进行点击、修改和排版，获得类似 Word 文档的直观编辑体验。

## 核心功能

- **交互式乐谱选择**：点击 SVG 中的音符、休止符、小节线等元素，实现视觉高亮选中，并自动关联底层的 MEI 数据。
- **可视化工具栏**：提供浮动工具栏，包含音高修改、时值变换、连线添加及常用记谱符号的快速插入。
- **右键上下文菜单**：针对不同类型的乐谱元素弹出特定操作菜单，如删除、属性编辑、布局调整等。
- **双向同步引擎**：在用户进行可视化操作时，后台实时更新 MEI 源码，并触发 Verovio 重新渲染，确保源码与预览高度一致。
- **画布手势操作**：支持缩放、平移乐谱，并能通过拖拽调整元素位置或力度记号。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **记谱引擎**: Verovio (WebAssembly 版本)
- **样式处理**: Tailwind CSS
- **状态管理**: Zustand (轻量级，适合处理复杂的 SVG 交互状态)
- **组件库**: shadcn/ui (基于 Radix UI，提供高质量的可访问性组件)

## 系统架构

### 架构设计

- **渲染层 (Rendering Layer)**: Verovio 将 MEI 转换为 SVG 并注入 DOM。
- **交互层 (Interaction Layer)**: 捕获 SVG 上的 Pointer 事件，利用 Verovio 的 `getElementAt` 和 `getElementsInRange` 方法映射物理坐标到逻辑元素。
- **逻辑层 (Logic Layer)**: 处理编辑命令（如 `edit.delete`, `edit.insert`），封装 Verovio 的 Toolkit 调用。
- **数据层 (Data Layer)**: 管理 MEI 源码状态，通过 Worker 线程处理重量级的渲染任务以保持 UI 流畅。

### 数据流

用户点击 SVG 元素 -> 交互层识别 ID -> 调用编辑命令 -> 更新 MEI 数据 -> 触发 Verovio 异步渲染 -> 更新 SVG 预览。

## 关键文件结构

```
project-root/
├── src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── ScoreViewer.tsx      # SVG 渲染与事件代理
│   │   │   ├── FloatingToolbar.tsx   # 浮动工具栏
│   │   │   └── ContextMenu.tsx       # 右键菜单
│   ├── hooks/
│   │   └── useVerovio.ts             # 封装 Verovio 实例与交互逻辑
│   ├── store/
│   │   └── editorStore.ts            # 全局编辑器状态（选中的 ID、工具配置）
│   └── utils/
│       └── meiTransform.ts           # MEI 源码处理工具函数
```

## 设计方案

采用 **Minimalist (极简主义)** 风格，专注于乐谱内容，减少视觉干扰。

- **Score Viewer (画布)**: 纯白背景，具有柔和阴影的纸张质感。选中的音符使用品牌色（如深蓝色）高亮，并带有微小的呼吸动画。
- **Floating Toolbar (工具栏)**: 采用玻璃拟态（Glassmorphism）效果，半透明背景，悬浮在画布上方。图标简洁，悬停时有背景色反馈。
- **Context Menu**: 遵循系统原生交互体验，菜单项间距合理，支持快捷键提示。
- **响应式布局**: 侧边栏可折叠以提供最大化的谱面展示空间。

## 代理扩展

### SubAgent

- **code-explorer**
- **用途**: 用于扫描当前项目中关于 Monaco 编辑器和 Verovio 渲染器的现有实现代码，理解现有的 MEI 加载逻辑。
- **预期成果**: 梳理出当前数据流向，确定 SVG 渲染容器的位置及现有的事件处理机制。