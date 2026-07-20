import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable in .env.local');
  process.exit(1);
}

// User Schema (Simplified version for seeding)
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
    studentId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Default passwords
    const password = await bcrypt.hash('password123', 10);

    // 1. Create Lecturer
    const lecturerEmail = 'lecturer@university.edu';
    const lecturerExists = await User.findOne({ email: lecturerEmail });
    if (!lecturerExists) {
      await User.create({
        name: 'Dr. Jane Smith',
        email: lecturerEmail,
        password: password,
        role: 'lecturer',
      });
      console.log(`Created Lecturer: ${lecturerEmail}`);
    } else {
      console.log(`Lecturer already exists: ${lecturerEmail}`);
    }

    // 2. Create Student
    const studentEmail = 'student@university.edu';
    const studentExists = await User.findOne({ email: studentEmail });
    if (!studentExists) {
      const studentId = `STU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await User.create({
        name: 'John Doe',
        email: studentEmail,
        password: password,
        role: 'student',
        studentId: studentId,
      });
      console.log(`Created Student: ${studentEmail}`);
    } else {
      console.log(`Student already exists: ${studentEmail}`);
    }

    // 3. Create Admin
    const adminEmail = 'admin@university.edu';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: password,
        role: 'admin',
      });
      console.log(`Created Admin: ${adminEmail}`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }

    console.log('\n--- Test Credentials ---');
    console.log('Admin:');
    console.log('  Email: admin@university.edu');
    console.log('  Password: password123');
    console.log('\nLecturer:');
    console.log('  Email: lecturer@university.edu');
    console.log('  Password: password123');
    console.log('\nStudent:');
    console.log('  Email: student@university.edu');
    console.log('  Password: password123');
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
