
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password:{
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password by default
     }
    },{
        timestamps: true, // why there is timestamps: true? It automatically adds createdAt and updatedAt fields to the schema, which can be useful for tracking when a user was created or last updated.
    }
)
// isModified is a method provided by Mongoose that checks if a particular field has been modified since the last save. In this case, it checks if the password field has been modified before hashing it. If the password hasn't been modified, it skips the hashing process and moves to the next middleware or operation.
// Hash password before saving
// CHANGED: This hook uses async/promise style instead of the old `next` callback.
// An async function returns a Promise, and Mongoose waits for it before saving.
// This `return;` only ends the hook when the password is unchanged. It fulfills
// the Promise with `undefined`, which tells Mongoose the hook finished; saving continues.
// Otherwise, `await` waits for bcrypt to hash the changed password. If hashing
// fails, the Promise rejects and the save fails. `next()` is callback-style and
// is not provided to this async hook by Mongoose 9.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

export const User = mongoose.model('User', userSchema);