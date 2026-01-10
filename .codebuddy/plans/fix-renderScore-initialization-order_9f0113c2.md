---
name: fix-renderScore-initialization-order
overview: 修复 VerovioEditor 中 renderScore 函数的初始化顺序错误，解决 'Cannot access before initialization' 的 ReferenceError
todos:
  - id: analyze-hooks-order
    content: 分析 VerovioEditor.jsx 中所有 Hooks 的当前声明顺序和依赖关系
    status: completed
  - id: reorganize-hooks
    content: 重新组织 Hooks 顺序：将 renderScore 的 useCallback 定义移到第161行 useEffect 之前
    status: completed
    dependencies:
      - analyze-hooks-order
  - id: verify-dependencies
    content: 验证所有依赖关系是否正确，确保没有遗漏或循环依赖
    status: completed
    dependencies:
      - reorganize-hooks
  - id: test-fix
    content: 测试修复后的组件，确认 ReferenceError 已解决且功能正常
    status: completed
    dependencies:
      - verify-dependencies
---

## 问题概述

修复 VerovioEditor 组件中的 JavaScript 初始化顺序错误，该错误导致运行时抛出 ReferenceError: Cannot access 'renderScore' before initialization

## 核心问题

- useEffect hook（第161行）在执行时依赖 renderScore 函数
- renderScore 函数通过 useCallback 定义在第165行
- 由于 JavaScript 的暂时性死区（Temporal Dead Zone），useEffect 尝试访问尚未初始化的 renderScore 引用，导致错误

## 解决方案

调整代码结构，确保 renderScore 函数的定义在所有使用它的 useEffect 之前，消除初始化顺序冲突

## 技术分析

### 问题根因

React Hooks 的执行顺序遵循代码书写顺序。当 useEffect 依赖数组中引用了后续定义的 useCallback 时，会在首次渲染时触发暂时性死区错误。

### 解决策略

重新组织 Hooks 的声明顺序：

1. 将所有 useState 声明放在最前
2. 将 useCallback 定义的函数（包括 renderScore）移到依赖它们的 useEffect 之前
3. 确保依赖链的顺序正确：被依赖的函数 → 依赖该函数的 useEffect

### 技术要点

- 保持 React Hooks 的调用顺序一致性
- 遵循 "先定义后使用" 原则
- 不改变现有业务逻辑和功能

## 实施细节

### 代码重组方案

```javascript
// 正确的顺序结构
const VerovioEditor = () => {
  // 1. 所有 state 声明
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  
  // 2. useCallback 定义（renderScore 等）
  const renderScore = useCallback(() => {
    // 渲染逻辑
  }, [dependencies]);
  
  // 3. 使用 renderScore 的 useEffect
  useEffect(() => {
    renderScore();
  }, [renderScore]);
  
  return (/* JSX */);
};
```

### 修改范围

- 仅调整 VerovioEditor.jsx 文件中的 Hooks 声明顺序
- 不修改任何函数的实现逻辑
- 保持依赖数组不变