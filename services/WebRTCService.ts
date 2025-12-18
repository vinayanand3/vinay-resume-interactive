import { Peer, DataConnection } from 'peerjs'
import { v4 as uuidv4 } from 'uuid'

export type GraffitiPoint = [number, number, number] // x, y, z
export type GraffitiStroke = {
    id: string
    points: GraffitiPoint[]
    color: string
    userId: string
}

type PeerCallback = (data: any) => void

class WebRTCService {
    private peer: Peer | null = null
    private connections: Map<string, DataConnection> = new Map()
    private onDataCallbacks: PeerCallback[] = []
    public userId: string = uuidv4()

    constructor() {
        // Initialize PeerJS
        // Using default public cloud server for prototype
        import('peerjs').then(({ Peer }) => {
             this.peer = new Peer(this.userId)

             this.peer.on('open', (id) => {
                 console.log('My peer ID is: ' + id)
                 // In a real app, we would signal this ID to a presence server
                 // For now, we rely on manual connection or local network discovery if configured
                 this.scanForPeers()
             })
     
             this.peer.on('connection', (conn) => {
                 this.setupConnection(conn)
             })

             this.peer.on('error', (err) => {
                 console.warn('PeerJS error:', err)
             })
        })
    }

    private setupConnection(conn: DataConnection) {
        conn.on('data', (data) => {
            this.onDataCallbacks.forEach(cb => cb(data))
        })
        conn.on('open', () => {
            console.log('Connected to peer:', conn.peer)
            this.connections.set(conn.peer, conn)
        })
        conn.on('close', () => {
             this.connections.delete(conn.peer)
        })
    }

    // Connect to a known peer (e.g., from URL param)
    public connectToPeer(peerId: string) {
        if (!this.peer) return
        const conn = this.peer.connect(peerId)
        this.setupConnection(conn)
    }

    public broadcast(data: any) {
        this.connections.forEach(conn => {
            if (conn.open) conn.send(data)
        })
    }

    public onData(callback: PeerCallback) {
        this.onDataCallbacks.push(callback)
    }

    // Mock discovery for prototype
    private scanForPeers() {
        // Implementation dependent on signaling strategy
    }
}

export const webRTCService = new WebRTCService()
