import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const urlParam = query.url

  if (!urlParam || Array.isArray(urlParam) || typeof urlParam !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing image url' })
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(urlParam)
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid image url' })
  }

  const response = await fetch(targetUrl.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; DragonballNuxt/1.0)',
      'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
    }
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: `Upstream image fetch failed (${response.status})`
    })
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const buffer = await response.arrayBuffer()

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400'
    }
  })
})

