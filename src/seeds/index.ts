import mongoose from 'mongoose';
import { seedDatabase } from './seedData';
import { seedBrandsWithModels } from './seedBrands';
import { configs } from '../configs/config';
import {seedAdmin} from './seedAdmin';

async function runSeeds() {
    try {
        await mongoose.connect(configs.MONGO_URI);
        console.log('Connected to MongoDB');

        await seedDatabase();
        await seedAdmin();
        await seedBrandsWithModels();

        console.log(' All seeds completed successfully!');
    } catch (err) {
        console.error(' Seed error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

runSeeds();