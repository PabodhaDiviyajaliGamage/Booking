import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Save uploaded file to disk temporarily
 * @param {File} file - The uploaded file from FormData
 * @param {string} filename - The filename to save as
 * @returns {Promise<string>} - The file path
 */
export async function saveFile(file, filename) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create uploads directory if it doesn't exist
  const uploadDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const path = join(uploadDir, filename);
  await writeFile(path, buffer);
  return path;
}

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<string|null>} - Cloudinary URL or null
 */
export async function uploadToCloudinary(cloudinary, filePath, resourceType = 'image') {
  if (!filePath) return null;
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      folder: `trending/${resourceType}s`,
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload failed for ${resourceType}:`, error);
    return null;
  }
}
