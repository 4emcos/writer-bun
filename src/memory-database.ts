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
    private readonly data: ProcessedPayment[] = []
    private readonly mutex = new Mutex()

    async storePayment(payment: ProcessedPayment): Promise<void> {
        return this.mutex.runExclusive(async () => {
            this.data.push(payment)
        })
    }

    async getAllPayments(): Promise<ProcessedPayment[]> {
        return this.mutex.runExclusive(async () => {
            return this.data
        })
    }
}
