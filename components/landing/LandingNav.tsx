"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#ai-features", label: "AI Features" },
    { href: "#how-it-works", label: "How It Works" },
];

export function LandingNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center px-4 md:px-6">
                <Link className="flex items-center justify-center" href="#">
                    <Building2 className="h-7 w-7 mr-2 text-blue-600" />
                    <span className="text-xl font-bold">VenueManager</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="ml-auto hidden sm:flex items-center gap-4 sm:gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            href={link.href}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex items-center gap-2 ml-4">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/signup">Sign Up Free</Link>
                        </Button>
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <div className="ml-auto sm:hidden">
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
                                            Log In
                                        </Link>
                                    </Button>
                                    <Button asChild className="w-full">
                                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                                            Sign Up Free
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
