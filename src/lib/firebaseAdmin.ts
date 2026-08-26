// src/lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

/**
 * 初始化 Firebase Admin SDK (僅限 Server-side 執行)
 * 透過 Service Account 取得最高權限，可繞過 GFW 進行資料庫操作
 */
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        // Project ID 屬於公開資訊，可以直接共用之前設定的 NEXT_PUBLIC 變數
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // 關鍵處理：Vercel 環境變數有時會把換行符號當成純文字處理，這裡進行正則替換以確保格式正確
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin Initialized Successfully.');
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

// 導出 db (Firestore) 與 auth，供 Server Components 或 API Routes 呼叫
export const db = admin.firestore();
export const adminAuth = admin.auth();
