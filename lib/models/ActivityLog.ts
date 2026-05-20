import mongoose, { Document, Schema } from 'mongoose';

export type ActivityAction =
  | 'employee_created'
  | 'employee_updated'
  | 'employee_deleted'
  | 'user_registered'
  | 'user_login'
  | 'profile_updated'
  | 'image_uploaded';

export interface IActivityLog extends Document {
  action: ActivityAction;
  description: string;
  entityType: 'employee' | 'user';
  entityId: mongoose.Types.ObjectId;
  entityName: string;
  performedBy: mongoose.Types.ObjectId;
  performedByName: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action: {
      type: String,
      enum: ['employee_created', 'employee_updated', 'employee_deleted', 'user_registered', 'user_login', 'profile_updated', 'image_uploaded'],
      required: true,
    },
    description: { type: String, required: true },
    entityType: { type: String, enum: ['employee', 'user'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityName: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performedByName: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
