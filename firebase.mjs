import multer, { diskStorage } from "multer";
import { errorCodes } from "./core.mjs";
import admin from "firebase-admin";
import "dotenv/config";

// multer
const storageConfig = diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        console.log("mul-file: ", file);
        cb(null, `image-${new Date().getTime()}-${file.originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    console.log("abc...", file.mimetype, "abc...");
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new multer.MulterError('LIMIT_FILE_TYPE'));
    }
}

export const upload = multer({
    limits: {
        fileSize: 1024 * 1024, // in Bytes: Limit the file size to 1 MB (1024 bytes * 1024 )
    },
    storage: storageConfig,
    fileFilter: fileFilter
});

export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer error
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send({
                message: 'file size limit exceed, maximum limit 1MB',
                errorCode: errorCodes.FILE_SIZE_LIMIT_EXCEED,
            });
        } else if (err.code === 'LIMIT_FILE_TYPE') {
            return res.status(400).send({
                message: 'Invalid file type. Only images are allowed.',
                errorCode: errorCodes.INVALID_FILE_TYPE,
            });
        } else {
            return res.status(500).send({
                message: 'Internal server error',
                errorCode: errorCodes.UNKNOWN_SERVER_ERROR
            });
        }
    }
    next(err);
};


// storage bucket
const serviceAccount = {
    type: process.env.FIREBASE_STORAGE_TYPE,
    project_id: process.env.FIREBASE_STORAGE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_STORAGE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_STORAGE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace '\n' with actual line breaks
    client_email: process.env.FIREBASE_STORAGE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_STORAGE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_STORAGE_AUTH_URI,
    hart_uri: process.env.FIREBASE_STORAGE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_STORAGE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_STORAGE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_STORAGE_UNIVERSE_DOMAIN,
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
export const bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET);
