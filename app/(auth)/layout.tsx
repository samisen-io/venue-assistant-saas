import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">VenueAssistant</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Streamline your venue management
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
