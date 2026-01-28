"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type SignupStep = "form" | "otp";

interface PendingSignup {
    userId: string;
    email: string;
    fullName: string;
}

export default function SignupPage() {
    const [step, setStep] = useState<SignupStep>("form");
    const [isLoading, setIsLoading] = useState(false);
    const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
    const [otpValue, setOtpValue] = useState("");
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
        },
    });

    async function onSubmit(values: z.infer<typeof signupSchema>) {
        setIsLoading(true);
        try {
            // Sign up with Supabase Auth - this sends the OTP email
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // Store signup info for after OTP verification
                setPendingSignup({
                    userId: authData.user.id,
                    email: values.email,
                    fullName: values.fullName,
                });

                toast({
                    title: "Verification code sent",
                    description: "Please check your email for an 8-digit verification code.",
                });

                // Move to OTP step
                setStep("otp");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function onVerifyOtp() {
        if (!pendingSignup || otpValue.length !== 8) return;

        setIsLoading(true);
        try {
            // Verify OTP
            const { data, error } = await supabase.auth.verifyOtp({
                email: pendingSignup.email,
                token: otpValue,
                type: "signup",
            });

            if (error) throw error;

            if (data.user) {
                // User is now authenticated - create trial subscription
                try {
                    const trialRes = await fetch("/api/subscription/trial", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: data.user.id,
                            email: pendingSignup.email,
                            fullName: pendingSignup.fullName,
                        }),
                    });
                    if (!trialRes.ok) {
                        console.error("Trial subscription creation failed:", await trialRes.text());
                    }
                } catch (trialError) {
                    console.error("Trial subscription creation failed:", trialError);
                }

                toast({
                    title: "Email verified",
                    description: "Your account is ready. You have a 14-day free trial!",
                });

                router.push("/onboarding/venue-setup");
            }
        } catch (error) {
            toast({
                title: "Verification failed",
                description: error instanceof Error ? error.message : "Invalid or expired code",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function onResendOtp() {
        if (!pendingSignup) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: pendingSignup.email,
            });

            if (error) throw error;

            toast({
                title: "Code resent",
                description: "Please check your email for a new verification code.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to resend code",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // OTP verification step
    if (step === "otp" && pendingSignup) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Verify your email</CardTitle>
                    <CardDescription>
                        We sent a verification code to {pendingSignup.email}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={8}
                            value={otpValue}
                            onChange={setOtpValue}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                                <InputOTPSlot index={6} />
                                <InputOTPSlot index={7} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <Button
                        className="w-full"
                        onClick={onVerifyOtp}
                        disabled={isLoading || otpValue.length !== 8}
                    >
                        {isLoading ? "Verifying..." : "Verify email"}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Didn&apos;t receive the code?{" "}
                        <button
                            type="button"
                            onClick={onResendOtp}
                            disabled={isLoading}
                            className="underline hover:text-primary disabled:opacity-50"
                        >
                            Resend
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <button
                            type="button"
                            onClick={() => {
                                setStep("form");
                                setPendingSignup(null);
                                setOtpValue("");
                            }}
                            className="underline hover:text-primary"
                        >
                            Use a different email
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Signup form step
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
