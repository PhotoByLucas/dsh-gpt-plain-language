import assert from 'node:assert/strict'
import test from 'node:test'
import { apply, isGptModel } from '../index.js'

let section, preStep
apply({
  systemPrompt: { section(value) { section = value } },
  on(event, handler) {
    assert.equal(event, 'agent/pre-step')
    preStep = handler
  },
})

test('matches GPT model IDs independent of provider namespace', () => {
  for (const id of ['gpt-6.2-sol', 'openai/GPT-4o', 'chatgpt-4o-latest']) {
    assert.ok(isGptModel(id), id)
  }
  for (const id of ['deepseek-v4-pro', 'claude-opus', 'o3', 'not-gpt-4', undefined]) {
    assert.equal(isGptModel(id), false, id)
  }
})

test('adds style only for GPT without automatically triggering ELI5 HTML', () => {
  const text = section.text({ modelSelection: { model: 'gpt-6.2-sol' } })
  assert.match(text, /i-have-adhd:[\s\S]*eli5:/)
  assert.match(text, /don't make HTML/)
  assert.match(text, /explicitly invokes \/eli5/)
  assert.equal(section.text({ modelSelection: { model: 'deepseek-v4-pro' } }), '')
  assert.equal(section.text({}), '')
})

test('rebases from GPT to non-GPT while preserving step decisions', async () => {
  const enter = { kind: 'enter', messages: [] }
  const reject = { kind: 'reject' }
  const run = (previous, model, decision = enter) => preStep({
    agent: { session: { requestContext: () => previous && { model: previous } } },
    modelSelection: { model },
  }, async () => decision)
  assert.deepEqual(await run('gpt-5.4', 'deepseek-v4-pro'), { ...enter, startsRequestSeries: true })
  assert.equal(await run('gpt-5.4', 'gpt-6.2-sol'), enter)
  assert.equal(await run('deepseek-v4-pro', 'gpt-6.2-sol'), enter)
  assert.equal(await run(undefined, 'gpt-6.2-sol'), enter)
  assert.equal(await run('gpt-5.4', 'deepseek-v4-pro', reject), reject)
})
