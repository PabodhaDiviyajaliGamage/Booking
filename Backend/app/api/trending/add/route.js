import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrendingModel from '@/models/Trending';
import cloudinary from '@/lib/cloudinary';
import { saveFile, uploadToCloudinary } from '@/lib/fileUpload';
import { unlink } from 'fs/promises';

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    // Extract text fields
    const name = formData.get('name');
    const subname = formData.get('subname');
    const description = formData.get('description');
    const location = formData.get('location');
    const highlights = formData.get('highlights');
    const address = formData.get('address');
    const contact = formData.get('contact');
    const availableThings = formData.get('availableThings');

    // Extract files
    const image = formData.get('image');
    const image1 = formData.get('image1');
    const image2 = formData.get('image2');
    const image3 = formData.get('image3');
    const image4 = formData.get('image4');
    const image5 = formData.get('image5');
    const image6 = formData.get('image6');
    const video = formData.get('video');

    // Validate required fields
    if (!name || !subname || !description || !image) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields (Name, Subname, Description, Main Image)' },
        { status: 400 }
      );
    }

    // Save files to disk temporarily
    const imageFiles = [image, image1, image2, image3, image4, image5, image6];
    const savedFilePaths = [];

    try {
      // Save all image files
      for (let i = 0; i < imageFiles.length; i++) {
        if (imageFiles[i]) {
          const filename = `${Date.now()}-image${i}.${imageFiles[i].name.split('.').pop()}`;
          const path = await saveFile(imageFiles[i], filename);
          savedFilePaths.push(path);
        } else {
          savedFilePaths.push(null);
        }
      }

      // Save video if provided
      let videoPath = null;
      if (video) {
        const videoFilename = `${Date.now()}-video.${video.name.split('.').pop()}`;
        videoPath = await saveFile(video, videoFilename);
      }

      // Upload to Cloudinary
      const imageUrls = await Promise.all(
        savedFilePaths.map(path => uploadToCloudinary(cloudinary, path, 'image'))
      );

      // Ensure main image was uploaded
      if (!imageUrls[0]) {
        return NextResponse.json(
          { success: false, message: 'Main image upload failed to Cloudinary.' },
          { status: 500 }
        );
      }

      // Upload video if provided
      let videoUrl = null;
      if (videoPath) {
        videoUrl = await uploadToCloudinary(cloudinary, videoPath, 'video');
        if (!videoUrl) {
          console.warn('Optional video upload failed for:', name);
        }
      }

      // Clean up temporary files
      for (const path of savedFilePaths) {
        if (path) {
          try {
            await unlink(path);
          } catch (e) {
            console.error('Failed to delete temp file:', path);
          }
        }
      }
      if (videoPath) {
        try {
          await unlink(videoPath);
        } catch (e) {
          console.error('Failed to delete temp video file:', videoPath);
        }
      }

      // Prepare data to save in DB
      const trendingData = {
        name,
        subname,
        description,
        videoUrl,
        image: imageUrls[0],
        image1: imageUrls[1],
        image2: imageUrls[2],
        image3: imageUrls[3],
        image4: imageUrls[4],
        image5: imageUrls[5],
        image6: imageUrls[6],
        location,
        highlights,
        address,
        contact,
        availableThings: availableThings
          ? availableThings.split(',').map(item => item.trim()).filter(item => item.length > 0)
          : [],
      };

      // Save to MongoDB
      const trendingItem = new TrendingModel(trendingData);
      await trendingItem.save();

      return NextResponse.json({
        success: true,
        message: 'Trending item added successfully'
      });

    } catch (uploadError) {
      // Clean up any saved files on error
      for (const path of savedFilePaths) {
        if (path) {
          try {
            await unlink(path);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
      throw uploadError;
    }

  } catch (error) {
    console.error('Error adding trending:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
