# Contributing / 贡献指南

1. Use Node.js 24 and run `node --test` before opening a pull request. Add tests for changes to model matching or request handling.
2. If you change a DSH integration point, verify it against the declared DSH version and describe what you tested in a fresh chat. Keep both README files consistent with behavior.
3. For bug reports, include the DSH version, model ID, provider, expected behavior, and a minimal reproduction. Do not include credentials, private prompt contents, or raw session logs.

This repository implements a default response style; it is not the upstream distribution of either skill.
