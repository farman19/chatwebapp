import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // Install with: npm install uuid

// Setup destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "filessaveup/"); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // e.g. .jpg
    const baseName = path.basename(file.originalname, ext); // original filename without extension
    const uniqueName = `${baseName.replace(/\s+/g, "_")}-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });
