import { Schema, Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  user_id: string; // Matches 'userId' in DTO/Service
  password: string;
  name: string | null;
  loginType: string;
  passwordUpdatedAt: Date | null;
  roles: Types.ObjectId[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema: Schema<UserDocument> = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: null },
    passwordUpdatedAt: { type: Date, default: null },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role', default: [] }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'users' },
);
