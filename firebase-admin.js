import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database"; // 1. Import the database SDK

import serviceAccount from "./serviceAccount.json" with { type: "json" };

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

// 2. Export both instances
export const auth = getAuth();
export const db = getDatabase();