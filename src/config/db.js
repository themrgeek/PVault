import mongoose from 'mongoose';
import {config} from './env.js'

export async function connectDB(){
    try{
        await mongoose.connect(config.mongodbUri);
        // mongoose.connect syntax: mongoose.connect(uri, options);
        console.log('Database connected successfully');
    }
    catch (error){
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
    }
}