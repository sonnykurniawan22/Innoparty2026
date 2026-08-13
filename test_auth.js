import { GoogleAuth } from 'google-auth-library';
async function test() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  console.log("Client keys:", Object.keys(client));
  if (client.email) console.log("Email:", client.email);
  const credentials = await auth.getCredentials();
  console.log("Credentials:", credentials);
}
test().catch(console.error);
