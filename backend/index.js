/**
 * PHOTOMEMORY PRO - CORE API SERVER (AWS SDK V3 UNIFIED)
 * ---------------------------------------------------------
 */

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// AWS SDK v3 Imports
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { RekognitionClient, IndexFacesCommand } = require("@aws-sdk/client-rekognition");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// 1. APP & MIDDLEWARE INITIALIZATION
const app = express(); // Defined early so routes can use it
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 2. DATABASE & CLOUD INITIALIZATION
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// v3 Clients (Modular and more efficient for container memory)
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const rekClient = new RekognitionClient({ region: process.env.AWS_REGION });

// 3. MIDDLEWARE: SECURITY GATEKEEPER
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access Denied" });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        req.user = user;
        next();
    });
};

// ---------------------------------------------------------
// 4. PHOTOGRAPHER ROUTES
// ---------------------------------------------------------

/**
 * GENERATE UPLOAD URL: 
 * Allows photographers to upload directly to S3 without hitting the Node.js server.
 */
app.post('/api/upload-url', async (req, res) => {
    const { fileName, fileType, eventCode } = req.body;
    
    // Organizes files by event_code with a timestamp to prevent overwriting
    const s3Key = `${eventCode}/${Date.now()}_${fileName}`;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            ContentType: fileType,
        });

        // Generate a URL valid for 5 minutes for the 'PUT' operation
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        res.json({ uploadUrl, s3Key });
    } catch (err) {
        console.error("Presigned URL Error:", err);
        res.status(500).json({ error: "Could not generate upload authorization" });
    }
});

// ---------------------------------------------------------
// 5. AUTHENTICATION ROUTES
// ---------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName, selfieBase64 } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const indexCommand = new IndexFacesCommand({
            CollectionId: process.env.REKOGNITION_USERS_COLLECTION,
            Image: { Bytes: Buffer.from(selfieBase64, 'base64') }
        });

        const indexRes = await rekClient.send(indexCommand);

        if (!indexRes.FaceRecords || indexRes.FaceRecords.length === 0) {
            return res.status(400).json({ error: "No face detected in selfie." });
        }

        const faceId = indexRes.FaceRecords[0].Face.FaceId;

        const result = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, profile_face_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, hashedPassword, fullName, faceId]
        );

        res.status(201).json({ userId: result.rows[0].id, message: "Profile Created" });
    } catch (e) {
        console.error("Registration Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows[0] && await bcrypt.compare(password, user.rows[0].password_hash)) {
            const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, fullName: user.rows[0].full_name });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (e) {
        res.status(500).json({ error: "Login failed" });
    }
});

// ---------------------------------------------------------
// 6. VIRTUAL GALLERY LOGIC
// ---------------------------------------------------------

app.get('/api/photos/me', authenticate, async (req, res) => {
    try {
        const userData = await pool.query('SELECT profile_face_id FROM users WHERE id = $1', [req.user.id]);
        const userFaceId = userData.rows[0].profile_face_id;

        const photos = await pool.query('SELECT * FROM photos WHERE $1 = ANY(face_ids)', [userFaceId]);

        const gallery = await Promise.all(photos.rows.map(async (p) => {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: p.s3_key,
            });
            
            const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
            return { id: p.id, url, hasPaid: p.has_paid };
        }));

        res.json(gallery);
    } catch (e) {
        console.error("Gallery Fetch Error:", e);
        res.status(500).json({ error: "Could not fetch gallery" });
    }
});

app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 PhotoMemory Engine (v3) live on port ${PORT}`));

// Health Check Endpoint for Docker/Kubernetes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
