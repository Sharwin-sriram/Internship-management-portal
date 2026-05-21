require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function queryOfferLetters() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('--- OFFER LETTERS ---');
    const offers = await db.collection('offerletters').find({}).toArray();
    for (const o of offers) {
      console.log(`ID: ${o._id}`);
      console.log(`Company: ${o.company}`);
      console.log(`Student: ${o.student}`);
      console.log(`Application: ${o.application}`);
      console.log(`PDF URL: ${o.pdf_url}`);
      console.log(`Custom Details:`, o.custom_details);
      console.log('-----------------');
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

queryOfferLetters();
