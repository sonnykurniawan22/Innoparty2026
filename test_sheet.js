import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

async function test() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: '1Srfqia0jLwbHxbzZ3K8Z3KWQpjuyyN90x2Bd1kNYzpc',
      range: "'KKU'!B:E",
    });
    console.log("Success:", getRes.data.values.length, "rows");
  } catch (err) {
    console.error("Error reading sheet:", err.message);
    if (err.response) {
      console.error("Details:", err.response.data);
    }
  }
}
test().catch(console.error);
