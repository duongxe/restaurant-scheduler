import { useState, type FormEvent } from "react";
import { Button } from "../components/Button";

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError("Username or password is incorrect.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl flex-col justify-center">
        <div className="mb-8">
          <p className="text-sm font-bold text-slate-500">Staff roster</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">
            Sushi Revolution Roster
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Sign in with your username (lowercase, no spaces) and password.
          </p>
        </div>

        <form
          className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-bold text-slate-900">Login</h2>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Username
            <input
              autoComplete="username"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              disabled={isLoading}
              onChange={(event) =>
                setUsername(event.target.value.toLowerCase().replace(/\s+/g, ""))
              }
              placeholder="e.g. sohn"
              value={username}
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              disabled={isLoading}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <Button className="mt-5 w-full" disabled={isLoading} type="submit">
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
