"use client";
import { useState } from "react";

interface PasswordGeneratorProps {
  onPasswordGenerate?: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerate }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const similar = "il1Lo0O";
    
    if (excludeSimilar) {
      letters = letters.split('').filter(char => !similar.includes(char)).join('');
    }

    let chars = letters;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    let pass = "";
    if (letters) pass += letters[Math.floor(Math.random() * letters.length)];
    if (includeNumbers && numbers) pass += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSymbols && symbols) pass += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = pass.length; i < length; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }

    pass = pass.split('').sort(() => Math.random() - 0.5).join('');
    
    setPassword(pass);
    onPasswordGenerate?.(pass);
  };

  const copyPassword = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => {
        navigator.clipboard.writeText("");
        setCopied(false);
      }, 15000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const getPasswordStrength = (passLength: number) => {
    if (passLength < 8) return { strength: "Very Weak", color: "text-red-500" };
    if (passLength < 15) return { strength: "Weak", color: "text-orange-500" };
    if (passLength < 21) return { strength: "Good", color: "text-yellow-500" };
    return { strength: "Strong", color: "text-green-500" };
  };

  // Always show strength based on current length, even if no password generated yet
  const strengthInfo = getPasswordStrength(length);

  return (
    <div className="space-y-6">
      <div>
        <label className="flex justify-between items-center mb-2">
          <span className="font-medium text-card-foreground">Length: {length}</span>
          <span className={`text-sm font-medium ${strengthInfo.color}`}>
            {strengthInfo.strength}
          </span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="8"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((length - 8) / (32 - 8)) * 100}%, #374151 ${((length - 8) / (32 - 8)) * 100}%, #374151 100%)`
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={() => setIncludeNumbers(!includeNumbers)}
            className="w-4 h-4 text-primary rounded focus:ring-primary bg-background border-input"
          />
          <span className="text-card-foreground">Include Numbers (0-9)</span>
        </label>
        
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={() => setIncludeSymbols(!includeSymbols)}
            className="w-4 h-4 text-primary rounded focus:ring-primary bg-background border-input"
          />
          <span className="text-card-foreground">Include Symbols (!@#$...)</span>
        </label>
        
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeSimilar}
            onChange={() => setExcludeSimilar(!excludeSimilar)}
            className="w-4 h-4 text-primary rounded focus:ring-primary bg-background border-input"
          />
          <span className="text-card-foreground">Exclude Similar Characters (il1Lo0O)</span>
        </label>
      </div>

      <button
        onClick={generatePassword}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-semibold transition-colors"
      >
        Generate Password
      </button>

      {password && (
        <div className="space-y-3">
          <div className="bg-background border border-input rounded-lg p-4">
            <p className="font-mono text-lg text-card-foreground text-center break-all select-all">
              {password}
            </p>
          </div>
          <button
            onClick={copyPassword}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-secondary hover:bg-accent text-card-foreground border border-input'
            }`}
          >
            {copied ? '✓ Copied! (clears in 15s)' : 'Copy Password'}
          </button>
        </div>
      )}
    </div>
  );
}