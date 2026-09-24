import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as userService from '@/lib/server/services/userService';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.email('Please enter a valid email').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const message =
        Object.values(errors).flat()[0] || 'Invalid input';
      return NextResponse.json(
        { error: message },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;
    const user = await userService.createWithPassword({
      name,
      email: email.toLowerCase(),
      password,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: true, message: 'Account created successfully. You can now sign in.' },
      { status: 201 },
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
