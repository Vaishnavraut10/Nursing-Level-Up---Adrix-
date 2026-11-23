import { NextResponse } from 'next/server';
import * as userService from '@/lib/server/services/userService';
import { registerInputSchema } from '@/lib/validation';
import { ApiError } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerInputSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const message = Object.values(errors).flat()[0] || 'Invalid input';
      return NextResponse.json(
        { error: message },
        { status: 400 },
      );
    }

    const { name, identifier, email, phone, password } = parsed.data;
    const user = await userService.createWithPassword({
      name,
      identifier,
      email,
      phone,
      password,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Could not create account. Please check your details and try again.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: true, message: 'Account created successfully. You can now sign in.' },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status },
      );
    }
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
