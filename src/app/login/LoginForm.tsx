"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                // Generic error message as per spec
                setError("Ugyldig email eller adgangskode.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Der opstod en systemfejl.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    placeholder="medlem@dvk.dk"
                    disabled={isLoading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password" className="form-label">Adgangskode</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    placeholder="••••••••"
                    disabled={isLoading}
                />
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary submit-btn">
                {isLoading ? "Træder ind..." : "Træd ind i kælderen"}
            </button>

            <style jsx>{`
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .error-message {
          color: var(--wine-burgundy);
          background-color: rgba(75, 15, 28, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(75, 15, 28, 0.3);
          font-size: 0.9rem;
          text-align: center;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-input {
          background-color: var(--secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          outline: none;
          transition: var(--transition-normal);
          font-family: var(--font-inter), sans-serif;
        }

        .form-input:focus {
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 1px var(--accent-gold);
          background-color: var(--bg);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .submit-btn {
          margin-top: 1rem;
          width: 100%;
        }
      `}</style>
        </form>
    );
}
