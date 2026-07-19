import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";

import serviceAccount from "./serviceAccount.json" with { type: "json" };

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

export const auth = getAuth();
export const db = getDatabase();
export const messaging = getMessaging();