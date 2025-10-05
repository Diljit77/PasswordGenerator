
export async function deriveKey(password: string, saltBase64: string): Promise<CryptoKey> {
  const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 200000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(key: CryptoKey, data: object): Promise<{ iv: string; ciphertext: string }> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const dataString = JSON.stringify(data);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(dataString)
  );
  
  return {
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
  };
}

export async function decryptData(key: CryptoKey, ivBase64: string, ciphertextBase64: string): Promise<any> {
  try {
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv }, 
      key, 
      ciphertext
    );
    
    const dec = new TextDecoder();
    const decryptedString = dec.decode(decrypted);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}


export async function getUserEncryptionKey(userPassword: string, userSalt: string): Promise<CryptoKey> {
  return await deriveKey(userPassword, userSalt);
}