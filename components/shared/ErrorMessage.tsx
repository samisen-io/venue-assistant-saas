import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorMessage({
    title = "Error",
    message,
    onRetry
}: ErrorMessageProps) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-2">
                <p>{message}</p>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="w-fit bg-white text-destructive hover:bg-gray-100"
                    >
                        Try Again
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
