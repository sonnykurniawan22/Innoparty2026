import { google } from "googleapis";

export const getGoogleAuth = () => {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    privateKey = privateKey.replace(/\\n/g, '\n');
    privateKey = privateKey.replace(/^"|"$/g, '');
    
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
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      ],
    });
  }

  return new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
};
