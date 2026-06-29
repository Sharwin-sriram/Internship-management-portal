require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function queryCompanies() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('--- COMPANIES ---');
    const companies = await db.collection('companies').find({}).toArray();
    for (const c of companies) {
      console.log(`ID: ${c._id}`);
      console.log(`Company Name: ${c.company_name}`);
      console.log(`Legal Name: ${c.legal_name}`);
      console.log(`Address: ${c.address}`);
      console.log(`Primary Contact:`, c.primary_contact);
      console.log('-----------------');
    }
    
    console.log('--- STUDENTS ---');
    const students = await db.collection('students').find({}).toArray();
    for (const s of students) {
      console.log(`ID: ${s._id}`);
      console.log(`College: ${s.college}`);
      console.log(`Address: ${s.address}`);
      console.log('-----------------');
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

queryCompanies();
