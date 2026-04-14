const express = require('express');
const {getDoctors,getPendingDoctors,getDoctor,updateDoctor,approveDoctor,rejectDoctor,dashboardDoctor} = require('./doctors.Controller.js')
const doctorRouter = express.Router();
const {authMiddleware} = require('../../middleware/auth.middleware.js');
const { roleMiddleware } = require('../../middleware/role.middleware.js');

doctorRouter.get('/',authMiddleware,roleMiddleware(['admin','patient']),getDoctors);
doctorRouter.get('/pending',authMiddleware,roleMiddleware(['admin']),getPendingDoctors);
doctorRouter.get(`/:id`,authMiddleware,roleMiddleware(['doctor']),getDoctor);
doctorRouter.patch(`/:id`,authMiddleware,roleMiddleware(['doctor']),updateDoctor);
doctorRouter.patch(`/:id/approve`,authMiddleware,roleMiddleware(['admin']),approveDoctor);
doctorRouter.patch(`/:id/reject`,authMiddleware,roleMiddleware(['admin']),rejectDoctor);
doctorRouter.get(`/:id/stats`,authMiddleware,roleMiddleware(['doctor']),dashboardDoctor);

module.exports = { doctorRouter };