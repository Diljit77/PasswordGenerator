// app/vault/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";
import { VaultService, VaultItemData } from "@/app/services/vaultService";
import PasswordGenerator from "../components/PasswordGenerator";
import VaultItemModal from "../components/VaultItemModal";

interface DecryptedVaultItem extends VaultItemData {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  decryptionError?: boolean;
}

export default function VaultPage() {
  const [vault, setVault] = useState<DecryptedVaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, encryptionKey, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuthAndLoadVault = async () => {
      const token = localStorage.getItem("token");
      
      if (!token || !user) {
        router.push("/login");
        return;
      }

      if (!encryptionKey) {
        setError("Encryption key not available. Please log in again.");
        setLoading(false);
        return;
      }

      await fetchVault();
    };

    checkAuthAndLoadVault();
  }, [user, encryptionKey, router]);

  const fetchVault = async () => {
    try {
      setLoading(true);
      setError("");

      const encryptedItems = await VaultService.getItems();
      
      if (encryptionKey) {
        const decryptedItems = await VaultService.decryptAllItems(
          encryptionKey, 
          encryptedItems
        );
        setVault(decryptedItems);
      }
    } catch (error: any) {
      console.error("Failed to fetch vault:", error);
      setError(error.message || "Failed to load vault");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (itemData: VaultItemData) => {
    if (!encryptionKey) {
      alert("Encryption key not available. Please log in again.");
      return false;
    }

    try {
      await VaultService.saveItem(encryptionKey, itemData);
      await fetchVault();
      return true;
    } catch (error: any) {
      console.error("Failed to save item:", error);
      alert(error.message || "Failed to save item");
      return false;
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const filteredVault = vault.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    (item.username && item.username.toLowerCase().includes(search.toLowerCase())) ||
    (item.url && item.url.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🔐 My Secure Vault</h1>
            <p className="text-muted-foreground mt-2">
              {vault.length} password{vault.length !== 1 ? 's' : ''} stored
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add Item
            </button>
            <button
              onClick={toggleTheme}
              className="bg-secondary hover:bg-accent text-foreground px-4 py-3 rounded-lg font-semibold transition-colors border"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-secondary hover:bg-accent text-foreground px-6 py-3 rounded-lg font-semibold transition-colors border"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
        
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-xl p-6 sticky top-8 border">
              <h2 className="text-xl font-bold text-card-foreground mb-6">Password Generator</h2>
              <PasswordGenerator onPasswordGenerate={(password) => {
                console.log("Generated:", password);
              }} />
            </div>
          </div>

    
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl shadow-xl p-6 border">
          
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="🔍 Search by title, username, or URL..."
                  className="w-full bg-background border border-input rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

            
              <div className="space-y-4">
                {filteredVault.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      {vault.length === 0 ? "Your vault is empty" : "No items found"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {vault.length === 0 
                        ? "Get started by adding your first password" 
                        : "Try adjusting your search terms"}
                    </p>
                    {vault.length === 0 && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Add Your First Item
                      </button>
                    )}
                  </div>
                ) : (
                  filteredVault.map((item) => (
                    <VaultItemCard 
                      key={item._id} 
                      item={item} 
                      onUpdate={fetchVault}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <VaultItemModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

// Vault Item Card Component
function VaultItemCard({ item, onUpdate }: { item: any; onUpdate: () => void }) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`✅ ${type} copied to clipboard! Will clear in 15 seconds.`);
      setTimeout(() => navigator.clipboard.writeText(""), 15000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/vault/${item._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onUpdate();
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert("Failed to delete item");
    }
  };

  return (
    <div className="bg-secondary/50 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-xl text-card-foreground">{item.title}</h3>
        <button
          onClick={handleDelete}
          className="text-destructive hover:text-destructive/80 text-sm font-medium px-3 py-1 rounded-lg hover:bg-destructive/10 transition-colors"
        >
          Delete
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Username:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-background px-3 py-1 rounded text-sm border">
              {item.username}
            </span>
            <button
              onClick={() => copyToClipboard(item.username, "Username")}
              className="text-primary hover:text-primary/80 text-sm font-medium px-2 py-1 rounded hover:bg-primary/10 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Password:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-background px-3 py-1 rounded text-sm border">
              {showPassword ? item.password : '•'.repeat(12)}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground text-sm font-medium px-2 py-1 rounded hover:bg-accent transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => copyToClipboard(item.password, "Password")}
                className="text-primary hover:text-primary/80 text-sm font-medium px-2 py-1 rounded hover:bg-primary/10 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {item.url && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">URL:</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm truncate max-w-[200px] font-medium"
            >
              {item.url}
            </a>
          </div>
        )}

        {item.notes && (
          <div>
            <span className="text-muted-foreground font-medium block mb-2">Notes:</span>
            <p className="text-card-foreground bg-background/50 p-3 rounded-lg border text-sm">
              {item.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}