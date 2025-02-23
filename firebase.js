const admin = require("firebase-admin");

// Retrieve the base64-encoded service account JSON from the environment variable
const base64Credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

// Decode the base64 string and parse it into a JSON object
const serviceAccount = JSON.parse(Buffer.from(base64Credentials, "base64").toString("utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
