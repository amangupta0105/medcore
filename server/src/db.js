require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
const mongoose = require('mongoose');

const connectDb = mongoose.connect(MONGO_URI).then(()=>console.log('Database successfully connected')
).catch((err)=>console.log(`Error in connecting database`,err));

module.exports ={connectDb}