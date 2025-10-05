// services/vaultService.ts
import { encryptData, decryptData } from "../lib/crypto";

export interface VaultItemData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export class VaultService {
  static async encryptItem(
    encryptionKey: CryptoKey, 
    itemData: VaultItemData
  ): Promise<{ ciphertext: string; iv: string; title: string }> {
    try {
      const { ciphertext, iv } = await encryptData(encryptionKey, {
        username: itemData.username,
        password: itemData.password,
        url: itemData.url,
        notes: itemData.notes
      });

      return {
        ciphertext,
        iv,
        title: itemData.title // Keep title unencrypted for search
      };
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt vault item");
    }
  }

  static async decryptItem(
    encryptionKey: CryptoKey,
    ciphertext: string,
    iv: string
  ): Promise<Omit<VaultItemData, 'title'>> {
    try {
      const decryptedData = await decryptData(encryptionKey, iv, ciphertext);
      return decryptedData;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt vault item");
    }
  }

  static async saveItem(
    encryptionKey: CryptoKey,
    itemData: VaultItemData
  ): Promise<any> {
    const encryptedData = await this.encryptItem(encryptionKey, itemData);
    
    const token = localStorage.getItem("token");
    const res = await fetch("/api/vault", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(encryptedData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to save item");
    }

    return await res.json();
  }

  static async getItems(): Promise<any[]> {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/vault", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch vault items");
    }

    const data = await res.json();
    return data.items || [];
  }

  static async decryptAllItems(
    encryptionKey: CryptoKey,
    encryptedItems: any[]
  ): Promise<any[]> {
    const decryptedItems = await Promise.all(
      encryptedItems.map(async (item) => {
        try {
          const decryptedData = await this.decryptItem(
            encryptionKey, 
            item.ciphertext, 
            item.iv
          );
          
          return {
            _id: item._id,
            title: item.title,
            ...decryptedData,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          };
        } catch (error) {
          console.error(`Failed to decrypt item ${item._id}:`, error);
          return {
            _id: item._id,
            title: item.title,
            username: "Decryption failed",
            password: "Decryption failed",
            url: "",
            notes: "",
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            decryptionError: true
          };
        }
      })
    );

    return decryptedItems;
  }
}