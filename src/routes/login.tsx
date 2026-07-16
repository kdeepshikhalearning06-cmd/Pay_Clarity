import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout, SocialButtons, Divider } from "@/components/auth/AuthLayout";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — PayClarity" },
      { name: "description", content: "Sign in to your PayClarity workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();

  setLoading(true);
  setError(null);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  setLoading(false);

  if (error) {
    setError(error.message);
    return;
  }

  navigate({ to: "/app" });
}

  return (
    <AuthLayout>
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-teal">
        <Sparkles className="h-3.5 w-3.5" /> Welcome back
      </div>
      <h1 className="font-display text-3xl font-semibold">Log in to PayClarity</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Continue your pay transparency workflow.
      </p>

      <div className="mt-8">
        <SocialButtons />
        <Divider label="Or continue with email" />

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anna@company.eu"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Password</label>
              <Link to="/coming-soon" className="text-xs text-teal hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
              required
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-teal hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}