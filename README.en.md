# Plain language for GPT

[简体中文](README.md) · [Architecture](docs/architecture.md) · [Contributing](CONTRIBUTING.md)

A DeepSeek Harness (DSH) plugin that asks GPT to lead with the answer, use everyday language, and give a concrete next action when needed. It adapts the conversational parts of `i-have-adhd` and `eli5`; it does not invoke their slash commands or turn ordinary chats into HTML explanations.

## Get started

1. Use DSH **`0.2.2-rc.5`**, the version currently declared and verified.
2. Clone this repository: `git clone https://github.com/PhotoByLucas/dsh-gpt-plain-language.git`.
3. In DSH, open **Plugins → Add plugin**, select the cloned directory, and enable **Plain language for GPT**. Local installation links the source directory, so keep it in place.
4. Start a new chat with a GPT model and ask, for example: “Explain a cache using an everyday example.”

The plugin matches the selected model ID, not the provider: `gpt-6.2-sol` and `openai/GPT-4o` match; `o3` and DeepSeek do not. The built-in rules are defaults, and your requested format or depth takes priority. The plugin does not read local skills or make extra model calls. When the original `/eli5` skill is available, you can still invoke it manually for an HTML explanation.

Say `normal mode` or `stop adhd mode` to ask the model to stop the ADHD style in the current conversation; this is a prompt-based preference, not a hard toggle. To disable the entire plugin, turn it off in Plugins and start a new chat.

A live DSH session log confirmed that the `codex` route's `gpt-6.2-sol` request included both sets of rules. Model matching, conditional assembly, and the switch-away hook are covered by unit tests. Run `node --check index.js` and `node --test` with Node.js 24. No dependencies are required.

[MIT License](LICENSE)
