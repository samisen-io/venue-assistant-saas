import { NextResponse } from 'next/server'
import { createTrialSubscription } from '@/lib/subscription/trial'

export async function POST(request: Request) {
    try {
        const { userId, email, fullName } = await request.json()

        if (!userId || !email) {
            return new NextResponse('userId and email are required', { status: 400 })
        }

        const subscription = await createTrialSubscription(userId, email, fullName)
        return NextResponse.json(subscription)
    } catch (error) {
        console.error('Error creating trial subscription:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
