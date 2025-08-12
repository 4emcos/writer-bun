import { unlink } from 'fs/promises'
import { MemoryDatabase } from './memory-database'

const db = new MemoryDatabase()

const handleRequest = async (req: Request) => {
    try {
        const url = new URL(req.url, 'http://localhost')

        if (req.method === 'POST' && url.pathname === '/store') {
            const { payment } = await req.json()
            await db.storePayment(payment)
            return new Response('', { status: 204 })
        }

        if (req.method === 'GET' && url.pathname === '/getAll') {
            const all = await db.getAllPayments()
            return new Response(JSON.stringify( all ))
        }

        return new Response('Not found', { status: 404 })
    } catch (err) {
        console.error('Error handling request', err)
        return new Response('Internal Error', { status: 500 })
    }
}

const server = async (socketPath: string) => {
    try {
        try {
            await unlink(socketPath)
        } catch {}

        Bun.serve({
            fetch: handleRequest,
            development: false,
            unix: socketPath
        })

        await Bun.spawn(['chmod', '666', socketPath]).exited
        console.log(`running on unix socket: ${socketPath}`)
    } catch (err) {
        console.error('Server startup error:', err)
        process.exit(1)
    }
}

server(Bun.env.DATABASE_SOCKET_PATH || '/tmp/writer.sock').catch(console.error)
