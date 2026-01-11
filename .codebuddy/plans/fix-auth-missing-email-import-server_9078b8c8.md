---
name: fix-auth-missing-email-import-server
overview: 修复 authController.js 中缺失的 sendResetPasswordEmail 导入，解决 ReferenceError。
todos:
  - id: locate-files
    content: 使用 [subagent:code-explorer] 在工作空间中精确定位 authController.js 和 email.js 文件
    status: completed
  - id: read-email-util
    content: 查看 utils/email.js 确认 sendResetPasswordEmail 的导出定义
    status: completed
    dependencies:
      - locate-files
  - id: check-controller-logic
    content: 读取 authController.js 中的 forgotPassword 逻辑及现有导入语句
    status: completed
    dependencies:
      - locate-files
  - id: fix-import-error
    content: 在 authController.js 中添加缺失的 sendResetPasswordEmail 解构导入
    status: completed
    dependencies:
      - read-email-util
      - check-controller-logic
  - id: verify-syntax
    content: 检查并修复 authController.js 中任何因缺失导入导致的语法或引用错误
    status: completed
    dependencies:
      - fix-import-error
---

## 产品概述

修复后端认证控制器中因缺失邮件发送函数导入而导致的重置密码功能失效问题。

## 核心功能

- **修复导入错误**：在 `authController.js` 中引入缺失的 `sendResetPasswordEmail` 函数，消除 `ReferenceError`。
- **重置密码逻辑验证**：确保 `forgotPassword` 逻辑能够正确调用邮件服务。
- **代码一致性检查**：验证 `utils/email.js` 的导出与控制器的导入匹配。

## 技术栈

- **后端框架**: Node.js + Express
- **模块规范**: CommonJS 或 ES Modules (取决于现有代码)

## 实施细节

### 核心目录结构

```
music-notation/
└── src/ (或根目录)
    ├── controllers/
    │   └── authController.js  # 待修复导入的文件
    └── utils/
        └── email.js           # 导出邮件发送函数的文件
```

### 关键修复逻辑

在 `authController.js` 文件的顶部，确保从邮件工具类中正确解构导出：

```javascript
// 假设项目使用 CommonJS
const { sendResetPasswordEmail } = require('../utils/email');

// 或者假设项目使用 ES Modules
import { sendResetPasswordEmail } from '../utils/email.js';
```

## 代理扩展

### SubAgent

- **code-explorer**
- 目的：在大型代码库中快速定位 `authController.js` 和 `utils/email.js` 的准确路径，并检查现有的导出/导入模式。
- 预期结果：获取文件的完整路径及上下文代码片段。