const multer = require('multer');

// Set up multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage }).array("files"); // "files" is the key for multiple file uploads

module.exports = { upload };
