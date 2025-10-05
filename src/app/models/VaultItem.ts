// models/VaultItem.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;

  ciphertext: string;   
  iv: string;        

  title: string;        
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  ciphertext: { 
    type: String, 
    required: true 
  },
  iv: { 
    type: String, 
    required: true 
  },
  title: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

if (mongoose.models.VaultItem) {
  delete mongoose.models.VaultItem;
}

export default mongoose.model<IVaultItem>("VaultItem", VaultItemSchema);