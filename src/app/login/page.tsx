"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user) {
      router.push("/vault");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);

      await login(form.email, form.password, {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        encryptionSalt: data.user.encryptionSalt
      });

      setMessage("Login successful! Redirecting...");
      
      setTimeout(() => {
        router.push("/vault");
      }, 1000);

    } catch (error: any) {
      console.error("Login error:", error);
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="bg-card hover:bg-accent text-card-foreground p-3 rounded-xl font-semibold transition-all duration-300 border shadow-lg hover:shadow-xl hover:scale-105"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <div className="bg-card/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-md transform transition-all duration-500 hover:shadow-3xl border border-border/50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl text-white">🔐</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-card-foreground to-card-foreground/80 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Log in to access your secure vault
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-card-foreground font-semibold text-sm uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-background/50 border-2 border-input rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-foreground placeholder:text-muted-foreground hover:border-primary/30"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-card-foreground font-semibold text-sm uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-background/50 border-2 border-input rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-foreground placeholder:text-muted-foreground hover:border-primary/30"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg group"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-3"></div>
                Signing In...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span>Log In</span>
                <svg 
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-center font-medium backdrop-blur-sm border ${
            message.toLowerCase().includes("success") || message.toLowerCase().includes("redirecting")
              ? "bg-green-500/20 text-green-600 border-green-500/30"
              : "bg-destructive/20 text-destructive border-destructive/30"
          }`}>
            {message}
          </div>
        )}

        <div className="text-center mt-8 pt-6 border-t border-border/50">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className="text-primary font-bold hover:text-primary/80 transition-colors duration-300 hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground text-sm transition-all duration-300 hover:underline group"
          >
            <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}