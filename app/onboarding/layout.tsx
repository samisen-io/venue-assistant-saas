export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Let's get started</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Set up your first venue to begin
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
