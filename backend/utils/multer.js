import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "uploads/khasara";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const kycDir = "uploads/kyc";
if (!fs.existsSync(kycDir)) fs.mkdirSync(kycDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `khasara_${unique}${path.extname(file.originalname)}`);
  },
});

const kycStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, kycDir),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `kyc_${file.fieldname}_${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF, JPG, PNG files allowed"), false);
};

export const uploadKhasara = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("khasaraFile");

export const uploadKycDocs = multer({
  storage: kycStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "aadhaar_doc", maxCount: 1 },
  { name: "pan_doc", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
]);