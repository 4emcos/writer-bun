import { Mutex } from 'async-mutex'

interface Payment {
    correlationId: string
    amount: string
}

interface DefaultPayment extends Payment {
    requestedAt: string
    requestedAtUnix: number
}

interface ProcessedPayment extends DefaultPayment {
    processed?: boolean
}

export class MemoryDatabase {
    private readonly data = new Map<string, ProcessedPayment[]>()
    private readonly mutex = new Mutex()

    async storePayment(payment: ProcessedPayment): Promise<void> {
        return this.mutex.runExclusive(async () => {
            const key = payment.correlationId
            if (!this.data.has(key)) {
                this.data.set(key, [])
            }
            this.data.get(key)?.push(payment)
        })
    }

    async getAllPayments(): Promise<MapIterator<ProcessedPayment[]>> {
        return this.mutex.runExclusive(async () => {
            return this.data.values()
        })
    }
}
