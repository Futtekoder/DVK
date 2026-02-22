"use client";

import Error from "next/error";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-bg text-text-primary p-4">
                    <h2 className="text-3xl font-playfair text-wine-deep mb-4">Noget gik galt!</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => reset()}
                    >
                        Prøv igen
                    </button>
                </div>
            </body>
        </html>
    );
}
