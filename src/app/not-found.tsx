"use client";

import Link from "next/link";
import { Wine } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-bg text-center px-4 space-y-6">
            <Wine className="w-20 h-20 text-wine-deep opacity-50" />
            <h2 className="text-4xl font-playfair font-bold text-accent-gold">404 - Flasken blev ikke fundet</h2>
            <p className="text-text-secondary max-w-md">
                Vi har ledt i hele kælderen, men kunne ikke finde frem til den side, du leder efter.
            </p>
            <Link href="/" className="btn btn-primary mt-4">
                Gå tilbage til baren
            </Link>
        </div>
    );
}
