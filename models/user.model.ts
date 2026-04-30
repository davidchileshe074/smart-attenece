import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'lecturer', 'admin'],
      default: 'student',
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true, // Only required for students
    },
  },
  { timestamps: true }
);

// Check if the model exists before defining it to prevent errors in Next.js HMR
export default mongoose.models.User || mongoose.model('User', UserSchema);
