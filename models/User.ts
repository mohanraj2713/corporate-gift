import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  company: Schema.Types.ObjectId;
  companyName?: string;
  role: 'admin' | 'manager' | 'user';
  isApproved: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  companyName: { type: String },
  role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Clear mongoose model cache for Next.js hot reloading
delete models.User;
const User = models.User || model<IUser>('User', UserSchema);
export default User;
