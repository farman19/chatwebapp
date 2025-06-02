import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Cloudinary का configuration सेट करें
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary को default export करें
export default cloudinary;
