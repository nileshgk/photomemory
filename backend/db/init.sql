/**
 * PHOTOMEMORY PRO - CORE DATABASE SCHEMA
 * * ARCHITECTURE OVERVIEW:
 * This schema uses a "Soft-Link Biometric" design. 
 * Instead of physical folders, we use AWS Rekognition FaceIDs as the primary 
 * join key between User Identity and Event Photos.
 */

-- ---------------------------------------------------------
-- 1. USERS TABLE
-- Purpose: Stores authenticated guests and their master biometric signature.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,      -- Unique identifier for JWT Auth
    password_hash TEXT NOT NULL,              -- Argon2 or Bcrypt hash for security
    full_name VARCHAR(100),
    profile_face_id TEXT,                     -- THE KEY: The Master FaceId generated from their signup selfie
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 2. PHOTOS TABLE
-- Purpose: Records metadata for images uploaded by photographers to S3.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    event_code VARCHAR(50) NOT NULL,          -- Scopes photos to a specific event (e.g., TECH_CONF_2026)
    s3_key TEXT NOT NULL UNIQUE,              -- The unique path in S3; UNIQUE prevents duplicate indexing
    face_ids TEXT[],                          -- POSTGRES ARRAY: Stores every FaceId detected in the image
    has_paid BOOLEAN DEFAULT FALSE,           -- Logic gate for the Watermark Proxy (Sharp)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- 3. OPTIMIZATION & PERFORMANCE ENGINE
-- ---------------------------------------------------------

-- Speeds up User profile lookups during the Auth handshake
CREATE INDEX idx_user_face_id ON users(profile_face_id);

-- Speeds up general Event Gallery views
CREATE INDEX idx_photo_event_code ON photos(event_code);

/**
 * GIN (Generalized Inverted Index)
 * ---------------------------------------------------------
 * CRITICAL PERFORMANCE NOTE:
 * Since 'face_ids' is an array, a standard B-Tree index won't work.
 * The GIN index allows the database to perform "Array Contains" queries ($@$) 
 * in O(log n) time. This ensures that even if there are 100k photos, 
 * a guest can find "their" photos in milliseconds.
 */
CREATE INDEX idx_photo_faces_gin ON photos USING GIN (face_ids);
