import Link from "next/link";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <header className="border-b bg-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold">
                        VenueManager
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                            Pricing
                        </Link>
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}
