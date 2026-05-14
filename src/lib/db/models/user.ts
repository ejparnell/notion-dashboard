import mongoose, { Schema, model, models, type Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  hashedPassword: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: { type: String, required: true },
  },
  { timestamps: true }
)

// Prevent model re-compilation during Next.js hot reload
export const User = (models.User as mongoose.Model<IUser>) ?? model<IUser>('User', UserSchema)
