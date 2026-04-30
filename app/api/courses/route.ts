import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/course.model';

// GET: Fetch all courses
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({}).populate('lecturer', 'name email');
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new course
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    const { title, code, lecturer, description } = body;

    if (!title || !code || !lecturer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, code, lecturer' },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title,
      code,
      lecturer,
      description,
    });

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Course code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
