"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    sectionName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(
            `Error in section "${this.props.sectionName || "unknown"}":`,
            error,
            errorInfo
        );
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Could not load{" "}
                                {this.props.sectionName
                                    ? `the ${this.props.sectionName} section`
                                    : "this section"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Something went wrong while rendering this content.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={this.handleRetry}
                            className="mt-1"
                        >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
