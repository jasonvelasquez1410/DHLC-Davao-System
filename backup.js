import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Note: You must download your Service Account Key from Firebase Console -> Project Settings -> Service Accounts
// and save it as 'serviceAccountKey.json' in the same folder as this script.

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: Could not find serviceAccountKey.json!');
  console.error('Please download your Service Account key from the Firebase Console:');
  console.error('1. Go to Project Settings -> Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save it in this root folder as "serviceAccountKey.json"');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function backupFirestore() {
  console.log('🔄 Starting full Firestore backup...');
  
  const backupData = {};
  const backupDir = './backups';
  
  // Ensure backups directory exists
  if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir);
  }

  try {
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log('⚠️ No collections found in this database.');
      return;
    }

    for (const collection of collections) {
      const collectionId = collection.id;
      console.log(`📦 Exporting collection: ${collectionId}...`);
      
      const snapshot = await collection.get();
      backupData[collectionId] = {};
      
      snapshot.forEach(doc => {
        backupData[collectionId][doc.id] = doc.data();
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupDir, `firestore-backup-${timestamp}.json`);
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    
    console.log('\x1b[32m%s\x1b[0m', `✅ Backup completed successfully: ${backupFilePath}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Backup failed:', error);
  }
}

backupFirestore();
