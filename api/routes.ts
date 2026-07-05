import express from "express";
import { google } from "googleapis";
import multer from "multer";
import { Readable } from "stream";

export const apiRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Google API Setup (Using Service Account)
const getGoogleAuth = () => {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google Service Account credentials in environment variables.");
  }
  
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  // Fix formatting issues commonly encountered with environment variables
  privateKey = privateKey.replace(/\\n/g, '\n');
  privateKey = privateKey.replace(/^"|"$/g, ''); // Remove wrapping quotes if present
  
  // Ensure standard PEM formatting if newlines are completely stripped
  if (!privateKey.includes('\n')) {
    const match = privateKey.match(/(-----BEGIN PRIVATE KEY-----)(.*?)(-----END PRIVATE KEY-----)/);
    if (match) {
      privateKey = `${match[1]}\n${match[2].replace(/\s+/g, '').match(/.{1,64}/g)?.join('\n')}\n${match[3]}`;
    }
  }

  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ],
  });
};

apiRouter.post("/submit-attendance", upload.single("image"), async (req: any, res: any) => {
  try {
    const { name, department, nip, score, spreadsheetId, folderId } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({ error: "Name and image are required" });
    }

    const authClient = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth: authClient });
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // 1. Upload Image to Google Drive
    const media = {
      mimeType: 'image/jpeg',
      body: Readable.from(file.buffer),
    };

    let fileUrl = "";
    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (targetFolderId) {
      try {
        const fileMetadata = {
          name: `selfie_${name.replace(/\s+/g, '_')}_${Date.now()}.jpg`,
          parents: [targetFolderId],
        };

        const driveRes = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
        });

        const fileId = driveRes.data.id;
        fileUrl = driveRes.data.webViewLink || "";

        // 2. Make file publicly readable
        if (fileId) {
          await drive.permissions.create({
            fileId: fileId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
        }
      } catch (driveErr: any) {
        console.log(`Note: Drive upload failed (${driveErr.message}), falling back to base64.`);
        
        const base64Data = `data:image/jpeg;base64,${file.buffer.toString('base64')}`;
        if (base64Data.length < 45000) {
          fileUrl = base64Data;
        } else {
          fileUrl = `[Image too large to store in sheet. Drive upload failed: ${driveErr.message}]`;
        }
      }
    } else {
      const base64Data = `data:image/jpeg;base64,${file.buffer.toString('base64')}`;
      if (base64Data.length < 45000) {
        fileUrl = base64Data;
      } else {
        fileUrl = "[Image too large to store in sheet. No Drive Folder ID provided.]";
      }
    }

    // 3. Save to Google Sheets
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    const targetSheetId = spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;
    
    if (!targetSheetId) {
      return res.status(500).json({ error: "Spreadsheet ID is not configured." });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: targetSheetId,
      range: 'Sheet1!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, name, department || '-', nip || '-', score, fileUrl]],
      },
    });

    res.json({ success: true, fileUrl });
  } catch (error: any) {
    console.error("Submit error:", error);
    
    let errorMessage = error.message || "Gagal menyimpan data";
    
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    }
    
    if (errorMessage.includes("has not been used in project")) {
      errorMessage = `API belum diaktifkan: ${errorMessage.split('Enable it by visiting')[0]}. Buka Google Cloud Console untuk mengaktifkannya.`;
    } else if (errorMessage.includes("does not have permission")) {
      errorMessage = "Service Account tidak memiliki akses. Pastikan email Service Account sudah ditambahkan sebagai Editor di Spreadsheet/Folder Drive.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});
