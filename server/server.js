require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const cors = require('cors');
const { authRouter } = require('./features/auth/auth.Router');
const { connectDb } = require('./src/db');

//middleware
app.use(express.json());
app.use(cors())

//databse connection
connectDb;

//routers

//auth-router
app.use('/api/auth',authRouter); 

app.listen(PORT,()=>console.log(`Server running at port : ${PORT}`))