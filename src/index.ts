import {Hono} from 'hono'
import {env} from 'hono/adapter'
import {sign} from '@tsndr/cloudflare-worker-jwt'

const app = new Hono()


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

    let playbackId = null

    try {
        playbackId = await c.req.json()
        if (!playbackId) {
            return c.json({error: 'Missing playbackId'}, 400)
        }
    } catch (err) {
        return c.json({error: 'Invalid JSON'}, 400)
    }

    const payload = {
        sub: playbackId['playbackId'],
        aud: 'v',
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // in seconds
        kid: keyId,
    }

    try {
        const token = await sign(payload, atob(keySecret), {
            algorithm: 'RS256',
        })
        return c.json({token})
    } catch (err) {
        console.error(err)
        return c.json({error: 'Failed to generate token'}, 500)
    }

})

export default app
