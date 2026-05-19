import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../src/models/Company.js';

dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to URI:', uri ? 'Loaded' : 'Not Loaded');
    await mongoose.connect(uri);
    console.log('Connected to DB successfully!');

    // Let's find one company in DB
    const existing = await Company.findOne();
    if (!existing) {
      console.log('No company found in DB');
      return;
    }
    console.log('Found company user id:', existing.user);

    const companyDetails = {
      name: 'Test Name',
      description: 'Test Desc',
      website: 'http://test.com',
      location: 'Test Location',
      industry: 'Test Industry',
      logo: 'Test Logo'
    };

    console.log('Running findOneAndUpdate...');
    const updatedDetails = await Company.findOneAndUpdate(
      { user: existing.user },
      { 
        $set: { 
          name: companyDetails.name,
          description: companyDetails.description,
          website: companyDetails.website,
          location: companyDetails.location,
          industry: companyDetails.industry,
          logo: companyDetails.logo
        } 
      },
      { new: true, runValidators: true, upsert: true }
    );
    console.log('Success!', updatedDetails);
  } catch (error) {
    console.error('Error occurred during query:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
