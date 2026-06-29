require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function queryStudent() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('Finding student document for user 6a0b25f1d85a065c11656477...');
    const student = await db.collection('students').findOne({ user: new ObjectId('6a0b25f1d85a065c11656477') });
    console.log('Student document:', student);
    
    console.log('Finding user document for 6a0b25f1d85a065c11656477...');
    const user = await db.collection('users').findOne({ _id: new ObjectId('6a0b25f1d85a065c11656477') });
    console.log('User document:', user);
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

queryStudent();
