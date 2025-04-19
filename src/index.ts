import {Hono} from 'hono'
import {env} from 'hono/adapter'
import {sign} from '@tsndr/cloudflare-worker-jwt'
import {cors} from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())


app.post('/get-token', async (c) => {
    const {CLIENT_SECRET} = env<{ CLIENT_SECRET: string }>(c)

    const clientSecret = c.req.header('X-Client-Secret')
    if (!clientSecret || clientSecret !== CLIENT_SECRET)
        return c.json({error: 'Invalid Key'}, 401)

    const clientEnv = c.req.header('X-Environment')
    if (!['production', 'testing'].includes(clientEnv?.toLowerCase() || ''))
        return c.json({error: 'Invalid Environment'}, 401)

    const isProd = clientEnv === 'production'
    const {
        [`MUX_SIGNING_KEY_ID_${isProd ? 'PROD' : 'TEST'}`]: keyId,
        [`MUX_SIGNING_KEY_SECRET_${isProd ? 'PROD' : 'TEST'}`]: keySecret
    } =
        env<Record<string, string>>(c)

    let body = null

    try {
        body = await c.req.json()
        if (!body)
            return c.json({error: 'Missing playbackId'}, 400)
    } catch (err) {
        return c.json({error: 'Invalid JSON'}, 400)
    }

    const payload: Record<string, any> = {
        sub: body['playbackId'],
        aud: 'v',
        exp: Math.floor(Date.now() / 1000) + (86400),
        kid: keyId,
    }

    if (body['assetTime'] && Number.isInteger(Number(body['assetTime']))) {
        payload['asset_end_time'] = body['assetTime']
    }
    
    try {
        const token = await sign(payload, atob(keySecret), {
            algorithm: 'RS256',
        })
        return c.json({token})
    } catch (err) {
        return c.json({error: 'Failed to generate token'}, 500)
    }
})

export default app
