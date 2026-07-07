import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/course.model';
import Attendance from '@/models/attendance.model';

type CourseWithStudents = {
  _id?: { toString(): string } | string;
  students?: Array<{ toString(): string } | string>;
  toObject?: () => Record<string, unknown>;
};

function toId(value: { toString(): string } | string | undefined) {
  return value ? value.toString() : '';
}

async function buildStudentCountMap(courseIds: string[]) {
  if (courseIds.length === 0) {
    return new Map<string, number>();
  }

  const attendance = (await Attendance.find({ course: { $in: courseIds } })
    .select('course student')
    .lean()) as Array<{ course?: { toString(): string } | string; student?: { toString(): string } | string }>;

  const recordedStudents = new Map<string, Set<string>>();

  for (const record of attendance) {
    const courseId = toId(record.course);
    const studentId = toId(record.student);
    if (!courseId || !studentId) continue;

    if (!recordedStudents.has(courseId)) {
      recordedStudents.set(courseId, new Set());
    }

    recordedStudents.get(courseId)?.add(studentId);
  }

  return new Map(Array.from(recordedStudents.entries()).map(([courseId, students]) => [courseId, students.size]));
}

// GET: Fetch all courses (optionally filter by lecturer)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const lecturerId = searchParams.get('lecturerId');

    const query: Record<string, unknown> = {};
    if (lecturerId) {
      query.lecturer = lecturerId;
    }

    const courses = (await Course.find(query)
      .populate('lecturer', 'name email')
      .populate('students', 'name studentId email')) as CourseWithStudents[];

    const studentCountMap = await buildStudentCountMap(courses.map((course) => toId(course._id)));

    const payload = courses.map((course) => {
      const plainCourse = typeof course.toObject === 'function' ? course.toObject() : course;
      const courseId = toId(course._id);
      const enrolledStudents = Array.isArray(course.students) ? course.students.length : 0;

      return {
        ...plainCourse,
        studentCount: enrolledStudents > 0 ? enrolledStudents : studentCountMap.get(courseId) || 0,
        recordedStudentCount: studentCountMap.get(courseId) || 0,
      };
    });

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load courses' },
      { status: 500 }
    );
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
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Course code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create course' },
      { status: 500 }
    );
  }
}
