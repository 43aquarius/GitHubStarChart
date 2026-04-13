import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // AI Key 从请求头获取（用户本地，不存服务器）
  const apiKey  = request.headers.get('X-AI-Key')
  const baseUrl = request.headers.get('X-AI-Base') ?? 'https://api.openai.com/v1'
  const model   = request.headers.get('X-AI-Model') ?? 'gpt-4o-mini'

  if (!apiKey) {
    return Response.json({ error: '未提供API Key' }, { status: 401 })
  }

  let body: { systemPrompt: string; userPrompt: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '请求格式错误' }, { status: 400 })
  }

  const { systemPrompt, userPrompt } = body
  if (!systemPrompt || !userPrompt) {
    return Response.json({ error: '缺少prompt参数' }, { status: 400 })
  }

  try {
    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   },
        ],
        max_tokens:  600,
        temperature: 0.85,   // 稍高温度增强文学性
      }),
    })

    if (!aiRes.ok) {
      const err = await aiRes.json().catch(() => ({}))
      const msg = (err as any)?.error?.message ?? `AI服务返回 ${aiRes.status}`
      return Response.json({ error: msg }, { status: aiRes.status })
    }

    const aiData = await aiRes.json()
    const result = aiData?.choices?.[0]?.message?.content as string
    if (!result) {
      return Response.json({ error: 'AI返回内容为空' }, { status: 500 })
    }

    return Response.json({ result: result.trim() })

  } catch (e) {
    const msg = e instanceof Error ? e.message : 'AI调用异常'
    return Response.json({ error: msg }, { status: 500 })
  }
}
