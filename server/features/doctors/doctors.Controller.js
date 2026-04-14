const { Doctor } = require("./doctors.model");

const getDoctors = async (req, res) => {
  try {
    const doctorsList = await Doctor.find({}).populate(
      "userId",
      "full_name email phone role isActive",
    );
    if (!doctorsList) throw new Error("Error in fetching doctor list");
    return res.status(200).json({
      status: true,
      message: "Successfully fetched",
      details: {
        doctorsList,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error in finding doctor",
      details: {
        error: error.message,
      },
    });
  }
};
const getPendingDoctors = async (req, res) => {
  try {
    const pendingList = await Doctor.find({ status: "pending" }).populate(
      "userId",
      "full_name email phone role isActive",
    );
    if (!pendingList) throw new Error("Error in fetching doctor pending list");
    return res.status(200).json({
      status: true,
      message: "Successfully fetched",
      details: {
        pendingList,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error in finding pending doctors api",
      details: {
        error: error.message,
      },
    });
  }
};
const getDoctor = async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        message: "You can only access your own profile",
      });
    }
    const findDoctor = await Doctor.findOne({ userId: req.user.id }).populate(
      "userId",
      "full_name email phone role isActive",
    );
    if (!findDoctor) throw new Error("Error in fetching doctor list");

    return res.status(200).json({
      status: true,
      message: "Successfully fetched your profile",
      details: {
        findDoctor,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error in get doctor details api",
      details: {
        error: error.message,
      },
    });
  }
};
const updateDoctor = async (req, res) => {
  const {
    specialization,
    experience,
    qualifications,
    availableDays,
    availableFrom,
    availableTo,
  } = req.body;

  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        message: "You can only access your own profile",
      });
    }
    const updateFields = {};

    if (specialization) updateFields.specialization = specialization;
    if (experience) updateFields.experience = experience;
    if (qualifications) updateFields.qualifications = qualifications;
    if (availableDays) updateFields.availableDays = availableDays;
    if (availableFrom) updateFields.availableFrom = availableFrom;
    if (availableTo) updateFields.availableTo = availableTo;
    const updateProfile = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      updateFields,
      {
        new: true,
        runValidators: true,
      },
    ).populate("userId", "full_name email phone role isActive");
    if (!updateProfile) throw new Error("Error in updating doctor profile");

    return res.status(200).json({
      status: true,
      message: "Successfully updated your profile",
      details: {
        updateProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error in updating doctor profile api",
      details: {
        error: error.message,
      },
    });
  }
};
const approveDoctor = async (req, res) => {
  try {
    const approveDoctor = await await Doctor.findOneAndUpdate(
      { userId: req.params.id },
      { status: "approved", rejectionReason: "" },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("userId", "full_name email phone role isActive");
    console.log(approveDoctor);

    if (!approveDoctor) throw new Error("Error in approving doctor");

    return res.status(200).json({
      status: true,
      message: "Successfully approved doctor",
      details: {
        doctorId: approveDoctor.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error in approving doctor profile api",
      details: {
        error: error.message,
      },
    });
  }
};
const rejectDoctor = async (req, res) => {
  const { rejectionReason } = req.body;
  try {
    const rejectedDoctor = await await Doctor.findOneAndUpdate(
      { userId: req.params.id },
      { status: "rejected", rejectionReason },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).populate("userId", "full_name email phone role isActive");

    if (!rejectedDoctor) throw new Error("Error in rejecting doctor");

    return res.status(200).json({
      status: true,
      message: "Successfully rejected doctor",
      details: {
        doctorId: rejectedDoctor.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error in rejecting doctor profile api",
      details: {
        error: error.message,
      },
    });
  }
};

//mock data
const dashboardDoctor = async (req, res) => {
        if (req.params.id !== req.user.id) {
      return res.status(403).json({
        message: "You can only access your own profile",
      });
    }
  return res.status(200).json({
    status: true,
    message: "Dashbord data",
    details: {
      totalPatientsToday: 20,
      completedConsultations: 10,
      pendingQueue: 3,
      averageWaitTime: "30min",
    },
  });
};

module.exports = {
  getDoctors,
  getPendingDoctors,
  getDoctor,
  updateDoctor,
  approveDoctor,
  rejectDoctor,
  dashboardDoctor,
};
