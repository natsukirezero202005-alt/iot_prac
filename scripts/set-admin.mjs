// Gives one existing account the "admin" custom claim.
// Run:  npm run set-admin -- you@example.com
// Needs scripts/serviceAccountKey.json (private key from the Firebase console; never commit it).
import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run set-admin -- you@example.com');
  process.exit(1);
}

const key = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(key) });

const user = await admin.auth().getUserByEmail(email);
await admin.auth().setCustomUserClaims(user.uid, { admin: true });
console.log(`Done. ${email} is now an admin. Log out and log in again in the app.`);
process.exit(0);
