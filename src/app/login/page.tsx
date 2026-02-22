import LoginForm from "./LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <main className="login-container">
      <div className="manifest-box">
        <h1 className="manifest-text">
          Alt købt skal drikkes<br />
          Intet helligt<br />
          Kun prop
        </h1>
      </div>

      <div className="login-box">
        <h2 className="login-title">DVK</h2>
        <LoginForm />
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--bg);
          padding: 2rem;
        }

        .manifest-box {
          text-align: center;
          margin-bottom: 4rem;
        }

        .manifest-text {
          font-family: var(--font-playfair), serif;
          color: var(--accent-gold);
          font-size: 2rem;
          line-height: 1.6;
          font-weight: 400;
          letter-spacing: 0.05em;
          text-shadow: 0 0 20px rgba(201, 164, 92, 0.2);
        }

        .login-box {
          width: 100%;
          max-width: 400px;
          background-color: var(--card);
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-soft);
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .login-title {
          text-align: center;
          font-family: var(--font-playfair), serif;
          color: var(--text-primary);
          font-size: 2.5rem;
          margin-bottom: 2rem;
          letter-spacing: 0.1em;
        }
      `}</style>
    </main>
  );
}
