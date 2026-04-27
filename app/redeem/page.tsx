"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RedeemPage() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsAuthenticated(!!session)
        }
        checkAuth()
    }, [supabase])

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code) return
        
        if (!isAuthenticated) {
            router.push(`/login?next=/redeem`)
            return
        }
        
        setLoading(true)
        try {
            const res = await fetch('/api/appsumo/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            
            toast({ 
                title: 'Success!', 
                description: 'Your Lifetime Deal has been activated. Welcome aboard!' 
            })
            router.push('/dashboard')
        } catch (err: any) {
            if (err.message === 'Unauthorized') {
                router.push(`/login?next=/redeem`)
            } else {
                toast({ title: 'Error', description: err.message, variant: 'destructive' })
            }
        } finally {
            setLoading(false)
        }
    }

    if (isAuthenticated === null) return null // loading auth state

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Redeem AppSumo Code</CardTitle>
                    <CardDescription>
                        Enter your lifetime deal code to upgrade your account instantly.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isAuthenticated ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                You need an account to redeem your code. Please sign up or log in first.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Button asChild>
                                    <Link href="/signup?next=/redeem">Create an Account</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/login?next=/redeem">Log In</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleRedeem} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="code" className="text-sm font-medium">Redemption Code</label>
                                <Input 
                                    id="code"
                                    value={code} 
                                    onChange={(e) => setCode(e.target.value)} 
                                    placeholder="e.g. AS-XXXX-XXXX-XXXX" 
                                    required 
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading || !code}>
                                {loading ? 'Redeeming...' : 'Redeem Lifetime Deal'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
