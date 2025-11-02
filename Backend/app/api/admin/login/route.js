import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('Received login request for:', email);

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Login successful - Generate JWT
      if (!JWT_SECRET) {
        console.error('JWT_SECRET is missing! Cannot generate token.');
        return NextResponse.json(
          { success: false, message: 'Server configuration error: JWT secret missing.' },
          { status: 500 }
        );
      }

      const payload = {
        userId: 'admin_user_id_123',
        email: email,
        role: 'admin'
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      console.log('Login successful for:', email);
      return NextResponse.json({
        success: true,
        message: 'Login successful!',
        token: token
      });
    } else {
      // Failed login
      console.log('Login failed for:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
