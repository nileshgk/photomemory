/**
 * PHOTOMEMORY PRO - AI WORKER (LAMBDA v3)
 * ---------------------------------------------------------
 * ARCHITECTURE: Event-driven face indexing using SDK v3.
 */

const { RekognitionClient, IndexFacesCommand } = require("@aws-sdk/client-rekognition");
const { Client } = require('pg');

// Initialize client outside the handler for container reuse
const rekClient = new RekognitionClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        const eventCode = key.split('/')[0];

        try {
            // STEP 1: AI INDEXING (v3 Command Pattern)
            const command = new IndexFacesCommand({
                CollectionId: process.env.REKOGNITION_EVENTS_COLLECTION,
                Image: { S3Object: { Bucket: bucket, Name: key } },
                DetectionAttributes: ['DEFAULT']
            });

            const indexResponse = await rekClient.send(command);

            // STEP 2: EXTRACT FACE IDs
            const faceIds = indexResponse.FaceRecords?.map(f => f.Face.FaceId) || [];

            // STEP 3: DATABASE UPDATE
            // We save the record even if 0 faces are found, so the photo appears in general galleries
            await client.query(
                'INSERT INTO photos (event_code, s3_key, face_ids) VALUES ($1, $2, $3)',
                [eventCode, key, faceIds]
            );
            
            console.log(`[SUCCESS] Key: ${key} | Faces Indexed: ${faceIds.length}`);

        } catch (err) {
            console.error(`[ERROR] Processing failed for ${key}:`, err);
        }
    }

    await client.end();
    return { status: 'success' };
};
