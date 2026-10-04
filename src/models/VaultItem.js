import mongoose from 'mongoose';

const vaultItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
      maxlength: [200, 'Site name must be under 200 characters'],
    },
    siteUrl: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [500, 'Site URL must be under 500 characters'],
    },
    username: {
      type: String,
      trim: true,
      maxlength: [200, 'Username must be under 200 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned unless explicitly requested
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes must be under 1000 characters'],
    },
  },
  { timestamps: true }
);

// Fast lookup: "all vault items for user X, newest first"
vaultItemSchema.index({ userId: 1, createdAt: -1 });

// Strip sensitive fields from JSON output
vaultItemSchema.methods.toJSON = function () {
  const item = this.toObject();
  delete item.__v;
  delete item.userId; // clients don't need to see this
  delete item.password;
  return item;
};

export const VaultItem = mongoose.model('VaultItem', vaultItemSchema);