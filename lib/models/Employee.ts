import mongoose, { Document, Schema } from 'mongoose';

export type EmployeeStatus = 'active' | 'inactive' | 'on-leave';
export type EmployeeRole = 'developer' | 'designer' | 'manager' | 'hr' | 'marketing' | 'sales' | 'finance' | 'other';

export interface IEmployee extends Document {
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  status: EmployeeStatus;
  joinedDate: Date;
  profileImage: string;
  phone: string;
  address: string;
  salary: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ['developer', 'designer', 'manager', 'hr', 'marketing', 'sales', 'finance', 'other'],
      required: true,
    },
    department: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
    joinedDate: { type: Date, default: Date.now },
    profileImage: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    salary: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// If index doesn't already exist, Mongoose will build it
EmployeeSchema.index({ name: 'text', email: 'text', department: 'text' });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
