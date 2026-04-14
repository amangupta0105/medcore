require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const cors = require('cors');
const { authRouter } = require('./features/auth/auth.Router');
const { connectDb } = require('./src/db');
const { doctorRouter } = require('./features/doctors/doctors.Router');

//middleware
app.use(express.json());
app.use(cors())

//databse connection
connectDb;

//routers

//auth-routes
app.use('/api/auth',authRouter); 
//doctor-routes
app.use('/api/doctors',doctorRouter);

app.listen(PORT,()=>console.log(`Server running at port : ${PORT}`))