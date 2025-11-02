import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrendingModel from '@/models/Trending';

export async function GET(request) {
  try {
    await connectDB();
    const trends = await TrendingModel.find();
    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching trending data:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
