---
name: fix-verovio-editor-and-enhance-ui
overview: 修复 Verovio 编辑器的渲染和编辑问题，并增强 UI 功能（包括元数据编辑和常用代码片段）。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Professional Editor
    - Productivity
    - High Contrast
  fontSystem:
    fontFamily: Inter
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 14px
      weight: 500
    body:
      size: 13px
      weight: 400
  colorSystem:
    primary:
      - "#3B82F6"
      - "#2563EB"
    background:
      - "#0F172A"
      - "#F8FAFC"
    text:
      - "#F1F5F9"
      - "#1E293B"
    functional:
      - "#10B981"
      - "#EF4444"
todos:
  - id: explore-codebase
    content: 使用 [subagent:code-explorer] 扫描项目结构，定位 Verovio 初始化和渲染逻辑文件
    status: completed
  - id: fix-verovio-init
    content: 修复 Verovio Toolkit 异步加载逻辑，确保 WASM 模块正确初始化并能输出 SVG
    status: completed
    dependencies:
      - explore-codebase
  - id: fix-editor-interaction
    content: 修复 Monaco 编辑器的受控组件状态，解决无法编辑和预览不同步的问题
    status: completed
    dependencies:
      - fix-verovio-init
  - id: metadata-panel
    content: 实现 MEI 元数据解析层，创建表单化的元数据编辑侧边栏
    status: completed
    dependencies:
      - fix-editor-interaction
  - id: snippet-system
    content: 构建代码片段管理器，支持通过工具栏或快捷键插入常用 MEI 模板
    status: completed
    dependencies:
      - fix-editor-interaction
  - id: layout-optimization
    content: 优化编辑器 UI 布局，添加响应式侧边栏和更直观的工具栏状态反馈
    status: completed
    dependencies:
      - metadata-panel
      - snippet-system
  - id: final-testing
    content: 进行端到端测试，验证从源码修改到预览更新的全流程稳定性
    status: completed
    dependencies:
      - layout-optimization
---

## 产品概述

优化音乐记谱编辑器（Verovio Professional Editor），修复 MEI 源码编辑与乐谱预览的同步渲染问题，并提升界面操作效率。

## 核心功能

- **渲染引擎修复**：修复 Verovio Toolkit 的初始化逻辑，确保预览区域能实时、准确地根据 MEI 源码渲染五线谱。
- **源码编辑器维护**：解决编辑器无法正常输入或响应的问题，确保代码高亮与状态同步。
- **元数据快速编辑**：新增专门的元数据面板（MEI Header），支持通过表单形式修改标题、作曲家等信息，无需手动编写 XML。
- **常用代码片段（Snippets）**：集成快捷代码库，支持一键插入小节、音符、和弦等常用 MEI 结构。
- **UI/UX 增强**：优化分屏布局（Split View），增强顶部工具栏功能，提供更专业的沉浸式编辑环境。

## 技术栈

- **前端框架**: React + TypeScript
- **记谱引擎**: Verovio (WebAssembly 版)
- **代码编辑器**: Monaco Editor (提供强大的 XML/MEI 高亮与补全)
- **样式处理**: Tailwind CSS
- **状态管理**: React Context 或 Zustand (处理源码与元数据的同步)

## 系统架构

### 模块划分

- **Editor Module**: 基于 Monaco Editor 的源码编辑层，负责 MEI 文本的读写。
- **Rendering Module**: Verovio 核心层，通过 Web Worker 异步处理渲染请求，防止 UI 阻塞。
- **Metadata Module**: 元数据解析与生成层，将 XML 映射为表单数据。
- **Snippet Module**: 提供预定义的 MEI 模板片段。

### 数据流

1. 用户在 Editor 输入 MEI 源码。
2. 触发渲染逻辑，调用 Verovio Toolkit 转换为 SVG。
3. Preview 模块接收 SVG 并更新视图。
4. 元数据面板通过解析源码 Header 实现双向同步。

## 设计方案

采用专业生产力工具风格，强化“源码-预览”的对比感。编辑器区域使用深色主题（Dark Mode），预览区域使用高保真纸张效果（Light Mode）。

### 视觉与交互

- **分屏布局**：左侧为深色的代码编辑区，右侧为带阴影效果的白色虚拟纸张预览，中间支持拖拽调整比例。
- **浮动面板**：元数据编辑和代码片段通过可折叠的侧边栏或悬浮窗展示，减少对主视图的干扰。
- **状态反馈**：底部状态栏实时显示 Toolkit 状态、行号及渲染耗时。

## 代理扩展

### SubAgent

- **code-explorer**
- 目的：深入分析现有项目中 Verovio 的集成方式、Web Worker 的配置以及编辑器状态同步的逻辑漏洞。
- 预期结果：定位渲染区域为空的具体代码原因及编辑器不可用的冲突点。