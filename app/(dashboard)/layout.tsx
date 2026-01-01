import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full">
            <div className="hidden md:block">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
}
