"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
    { href: "/pricing", label: "Pricing" },
];

export function MarketingNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="border-b bg-white">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <span className="text-xl font-bold">VenueManager</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden sm:flex items-center gap-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
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

                {/* Mobile Navigation */}
                <div className="sm:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[280px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                    VenueManager
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-lg font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <hr className="my-4" />
                                <div className="flex flex-col gap-3">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/login" onClick={() => setIsOpen(false)}>
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button asChild className="w-full">
                                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                                            Get Started
                                        </Link>
                                    </Button>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
