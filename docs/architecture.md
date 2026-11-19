# 实现说明 / Architecture

本插件是一个运行在 DSH Host 的本地 bundle。不改 DSH 核心，也没有浏览器端代码。

## 加载链路 / Loading

1. [`package.json`](../package.json) 用 `dsh.bundle.patch` 声明补丁，并把包入口导出为 `./index.js`。
2. [`cordis.patch.yml`](../cordis.patch.yml) 插入一个名为 `local-gpt-plain-language` 的 Host 插件条目。
3. DSH 加载 [`index.js`](../index.js) 并调用 `apply(ctx)`。插件声明依赖 `systemPrompt`，注册一段系统提示和一个 `agent/pre-step` 监听器。`locale/` 和图标仅用于插件列表显示。

## 请求链路 / Request flow

```text
DSH 为本步确定模型 → 组装系统提示 → 记录有效提示 → 发送模型请求
                          │
                          ├─ GPT ID：加入两组内置表达规则
                          └─ 其他 ID：返回空字符串
```

- `isGptModel()` 去掉首尾空白，取模型 ID 最后一个 `/` 后的部分，再用不区分大小写的前缀规则匹配 `gpt` 或 `chatgpt`。它不从供应商推断模型家族，也不识别任意自定义别名。
- `ctx.systemPrompt.section()` 注册动态段落。DSH 组装时传入本步固定的 `modelSelection`；插件只决定自己的段落，不修改用户消息、不替换整个系统提示，也不在请求发出后改包。
- 对同一会话从 GPT 切到非 GPT 的情况，`agent/pre-step` 对照上一次已记录的模型。在该步允许进入时，保留原有决定并设置 `startsRequestSeries`，让 DSH 用不含 GPT 风格段落的系统提示开启新的请求序列。这用于处理可能保留旧系统提示的适配器；不会清空对话。

## 验证范围 / Verification

- 实际验证：DSH `0.2.2-rc.5` 下的新 GPT 会话，请求日志显示 `gpt-6.2-sol` 和两组规则。
- 本地验证：模型 ID 匹配、非 GPT 路径返回空内容、切换钩子处理正常步骤和被拒绝的步骤。测试使用模拟 DSH 接口，不需要模型账户，也不覆盖所有网络适配器。
- 版本依据：DSH `0.2.2-rc.5` 的 `@deepseek-ai/dsh-agent-loop/src/agent.ts`（模型选择与请求组装）和 `src/runtime-context.ts`（系统提示更新），以及运行时公开的 `systemPrompt` 服务与 `agent/pre-step` 事件。
