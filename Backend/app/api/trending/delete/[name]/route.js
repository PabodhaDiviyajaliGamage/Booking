import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrendingModel from '@/models/Trending';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(request, { params }) {
  // Verify JWT token
  const decoded = verifyToken(request);
  if (!decoded) {
    return unauthorizedResponse('Invalid or expired token');
  }

  const { name } = params;

  try {
    await connectDB();

    // Find and delete trending item by name
    const deletedTrending = await TrendingModel.findOneAndDelete({ name });

    if (!deletedTrending) {
      return NextResponse.json(
        { success: false, message: `Trending item with name "${name}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Trending item "${name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting trending item:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while deleting trending item' },
      { status: 500 }
    );
  }
}
