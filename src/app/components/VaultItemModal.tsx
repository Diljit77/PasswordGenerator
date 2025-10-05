// components/VaultItemModal.tsx
"use client";
import { useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";

export interface VaultItemData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

interface VaultItemModalProps {
  onClose: () => void;
  onSave: (itemData: VaultItemData) => Promise<boolean>;
  initialData?: VaultItemData;
}

export default function VaultItemModal({ onClose, onSave, initialData }: VaultItemModalProps) {
  const [form, setForm] = useState<VaultItemData>({
    title: initialData?.title || "",
    username: initialData?.username || "",
    password: initialData?.password || "",
    url: initialData?.url || "",
    notes: initialData?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const generatePassword = () => {
    const length = 16;
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.username.trim() || !form.password.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const success = await onSave({
        title: form.title.trim(),
        username: form.username.trim(),
        password: form.password,
        url: form.url.trim(),
        notes: form.notes.trim()
      });

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to save vault item:", error);
      alert("Failed to save item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">
              {initialData ? "Edit Item" : "Add New Item"}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-background border border-input rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                placeholder="e.g., Gmail Account"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Username/Email *
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-background border border-input rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                placeholder="username@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Password *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg p-3 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-foreground"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="bg-secondary hover:bg-accent text-foreground px-4 py-3 rounded-lg font-medium whitespace-nowrap border border-input transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                URL (optional)
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full bg-background border border-input rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full bg-background border border-input rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-secondary hover:bg-accent text-foreground py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 border border-input"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Item"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}