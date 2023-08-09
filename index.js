const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./key.json'); // Replace with your Firebase Admin SDK service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'testing-85b39.appspot.com' // Replace with your Firebase Storage bucket URL
});

const app = express();
const port = 3000;

app.use(express.json());

// Set up Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const bucket = admin.storage().bucket();
    const blob = bucket.file(file.originalname);

    const blobStream = blob.createWriteStream();
    blobStream.end(file.buffer);

    blobStream.on('finish', () => {
      res.status(200).send('File uploaded successfully.');
    });

    blobStream.on('error', (error) => {
        console.log({error})
      res.status(500).send('Error uploading file.');
    });
  } catch (error) {
    res.status(500).send('Server error.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
