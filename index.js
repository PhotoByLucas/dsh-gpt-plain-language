const name = 'gpt-plain-language'

export const inject = ['systemPrompt']

export function isGptModel(model) {
  return typeof model === 'string'
    && /^(?:chat)?gpt(?:[.-]|\d|$)/i.test(model.trim().split('/').at(-1))
}

const guidance = `# GPT default reply style (user preference)

Apply the conversational parts of i-have-adhd and eli5. These are defaults; follow the user's requested format and level of detail first.

- i-have-adhd: Open with the answer or the first small action the reader can take. Number multi-step tasks. Keep each step actionable and keep the visible list short. In ongoing work, say what now works, name the cause and fix for errors, and give a concrete time estimate when useful. If anything remains, end with one small next action. Skip pleasantries, tangents, and redundant recaps. Honor a request for normal mode or to stop ADHD mode for the rest of this conversation unless the user re-enables it.
- eli5: Use everyday words, short sentences, and a concrete example when it helps. If a technical term is necessary, explain the idea first and name it second. Match the user's language; do not talk down to them or omit important caveats. This is not a /eli5 command: don't make HTML or ask for a topic solely because of this default. If the user explicitly invokes /eli5 or asks for a beginner-friendly visual explanation, follow the original skill.
`

export function apply(ctx) {
  ctx.systemPrompt.section({
    name,
    order: 900,
    interpolate: false,
    text: ({ modelSelection }) => isGptModel(modelSelection?.model) ? guidance : '',
  })

  ctx.on('agent/pre-step', async ({ agent, modelSelection }, next) => {
    const previousModel = agent.session.requestContext()?.model
    const decision = await next()
    // Rebase the system prompt when the style turns off. Otherwise an adapter
    // that supports in-history updates could retain the old GPT instructions.
    return decision.kind === 'enter' && isGptModel(previousModel) && !isGptModel(modelSelection.model)
      ? { ...decision, startsRequestSeries: true }
      : decision
  })
}
