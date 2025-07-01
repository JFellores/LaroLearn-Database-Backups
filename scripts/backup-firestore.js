// scripts/backup-firestore.js
import fs from "fs";
import path from "path";
import admin from "firebase-admin";

async function main() {
  // load service account from env var
  const sa = JSON.parse(process.env.FIRESTORE_SA_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(sa),
  });

  const db = admin.firestore();
  const collections = await db.listCollections();
  const date = new Date().toISOString().slice(0, 10);
  const baseDir = path.join("backups", "firestore", date);
  fs.mkdirSync(baseDir, { recursive: true });

  for (const col of collections) {
    const snap = await col.get();
    const data = {};
    snap.forEach((doc) => (data[doc.id] = doc.data()));
    fs.writeFileSync(
      path.join(baseDir, `${col.id}.json`),
      JSON.stringify(data, null, 2)
    );
  }
  console.log("Firestore backup complete:", baseDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
