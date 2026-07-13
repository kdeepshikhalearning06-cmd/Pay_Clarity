import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout, SocialButtons, Divider } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — PayClarity" },
      { name: "description", content: "Start your 14-day PayClarity free trial." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("Please enter a valid work email.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    setTimeout(() => navigate({ to: "/onboarding" }), 700);
  }

  return (
    <AuthLayout>
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-teal">
        <Sparkles className="h-3.5 w-3.5" /> 14-day free trial
      </div>
      <h1 className="font-display text-3xl font-semibold">Create your workspace</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No credit card required. Cancel anytime.
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
              placeholder="you@company.eu"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
              required
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" variant="hero" size="lg" disabled={loading}>
            {loading ? "Creating your workspace…" : "Create account"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            By continuing you agree to the Terms and Privacy Policy.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-teal hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
