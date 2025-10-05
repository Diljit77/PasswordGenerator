// app/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "./context/ThemeContext";

export default function HomePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/vault");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="bg-secondary hover:bg-accent text-foreground p-3 rounded-lg font-semibold transition-colors border"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Secure Password Vault
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Generate strong passwords and store them securely with client-side encryption
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push("/signup")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 block w-full"
          >
            Get Started Free
          </button>
          <button
            onClick={() => router.push("/login")}
            className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 block w-full"
          >
            I Have an Account
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-card p-6 rounded-xl shadow-md border">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-card-foreground mb-2">Client-Side Encryption</h3>
            <p className="text-muted-foreground text-sm">Your data is encrypted before it leaves your device</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-md border">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-card-foreground mb-2">Password Generator</h3>
            <p className="text-muted-foreground text-sm">Create strong, unique passwords instantly</p>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-md border">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold text-card-foreground mb-2">Easy Access</h3>
            <p className="text-muted-foreground text-sm">Access your passwords anywhere, securely</p>
          </div>
        </div>
      </div>
    </div>
  );
}