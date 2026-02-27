const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== '.apk') {
        return cb(new Error('Only .apk files are allowed'), false);
    }

    const allowedMimes = [
        'application/vnd.android.package-archive',
        'application/octet-stream',
        'application/java-archive',
        'application/zip'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 120 * 1024 * 1024 // 120MB max
    }
});

module.exports = upload;
