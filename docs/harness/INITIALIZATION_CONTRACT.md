# INITIALIZATION_CONTRACT.md

## 初始化目标

项目使用 uni-app + Vue 3 + TypeScript 开发微信小程序，并预留微信云开发函数目录。

## 验证边界

- `npm run lint`：检查 TypeScript、Vue 与测试文件的基础代码规范。
- `npm run typecheck`：使用 `vue-tsc --noEmit` 检查类型。
- `npm run test`：运行 Vitest 单元测试。
- `npm run verify:static`：执行 lint 和 typecheck，作为第一层静态校验。
- `npm run verify:feature`：执行 Vitest 测试，作为第二层功能和业务逻辑验证。
- `npm run verify:system`：执行 `build:mp-weixin`，作为第三层系统级确认。
- `npm run verify:harness`：执行第三层门禁脚本，检查 feature 状态、完成证据和 `completionGate`。
- `npm run check`：依次执行静态、功能、系统和 harness gate 验证。具体完成规则见 `docs/harness/verification-policy.md`。

## 关键命令

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run verify:static
npm run verify:feature
npm run verify:system
npm run verify:harness
npm run check
npm run dev:mp-weixin
npm run build:mp-weixin
```

## 微信开发者工具

先执行：

```bash
npm run dev:mp-weixin
```

再用微信开发者工具打开项目根目录。`project.config.json` 指向 `dist/dev/mp-weixin/` 作为小程序源码目录，`cloud/functions/` 作为云函数目录。

## 当前约束

- `pages/` 放 uni-app 页面。
- `config/`、`models/`、`schemas/`、`services/` 放核心业务代码，保持与架构文档一致。
- 页面层不得直接调用本地存储、云数据库或外部 AI API。
- 云函数目录当前只有占位函数，不能放真实密钥。
