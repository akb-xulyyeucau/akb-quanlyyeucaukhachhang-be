import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../interfaces/user.interface';

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    alias: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'pm', 'guest'], default: 'guest' },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
export default User;
