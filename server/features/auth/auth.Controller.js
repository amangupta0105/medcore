require("dotenv").config();
const { User } = require("../../features/users/user.Schema.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token.js");
const JWT_REFRESH_KEY = process.env.REFRESH_KEY;

const userRegister = async (req, res) => {
  const { full_name, email, password, phone, role } = req.body;
  if (!full_name || !email || !password || !role) {
    return res.status(400).json({
      status: false,
      message: "Please fill required fields",
    });
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
      role,
    });
    if (!newUser) {
      return res.status(500).json({
        status: false,
        message: "Error in creating new User",
      });
    }

    const access_token = generateAccessToken(newUser);
    const refresh_token = generateRefreshToken(newUser);

    newUser.refreshToken = refresh_token;
    await newUser.save();
    return res.status(201).json({
      status: true,
      message: "User created successfully",
      details: {
        id: newUser.id,
        role: newUser.role,
        access_token: access_token,
        refresh_token: refresh_token,
      },
    });
  } catch (error) {
    console.log(error.code);
    if (error.code == 11000) {
      return res.status(409).json({
        status: false,
        message: "Email already exists!",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Error in creating new user",
      details: {
        error: error.message,
      },
    });
  }
};
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Please fill required fields",
    });
  }
  try {
    const findUser = await User.findOne({ email }).select("+password");
    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    const compare_password = await bcrypt.compare(password, findUser.password);
    if (!compare_password) {
      return res.status(401).json({
        status: false,
        message: "Password is wrong",
      });
    }
    const access_token = generateAccessToken(findUser);
    const refresh_token = generateRefreshToken(findUser);
    findUser.refreshToken = refresh_token;
    findUser.lastLogin = new Date();
    await findUser.save();

    return res.status(200).json({
      status: true,
      message: "Succesfully logged in",
      details: {
        access_token,
        refresh_token,
        id: findUser.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error during login",
      details: {
        error: error.message,
      },
    });
  }
};
const userLogout = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "Invalid user",
      });
    }

    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    findUser.refreshToken = null;
    await findUser.save();

    return res.status(200).json({
      status: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};
const userInfo = async (req, res) => {
  const userId = req.user.id;
  try {
    const findUser = await User.findById(userId).select("-password");
    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "User information found",
      details: findUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error in finding user",
      details: {
        error: error.message,
      },
    });
  }
};
const userChangePassword = async (req, res) => {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({
      status: false,
      message: "Please fill required fields",
    });
  }
  if (current_password === new_password) {
    return res.status(400).json({
      status: false,
      message: "New password must be different",
    });
  }
  try {
    const findUser = await User.findById(userId).select("+password");
    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    const compare_password = await bcrypt.compare(
      current_password,
      findUser.password,
    );
    if (!compare_password) {
      return res.status(401).json({
        status: false,
        message: "Password is wrong",
      });
    }
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    const updatePassword = await User.findByIdAndUpdate(
      findUser.id,
      {
        password: hashedPassword,
      },
      { new: true },
    );
    return res.status(200).json({
      status: true,
      message: "Password updated successfully",
      details: {
        userId: updatePassword.id,
      },
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Error in changing the password",
    });
  }
};
const getRefreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      status: false,
      message: "Refresh token required",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_KEY);

    const findUser = await User.findById(decoded.id);

    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (findUser.refreshToken !== refreshToken) {
      return res.status(403).json({
        status: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(findUser);
    const newRefreshToken = generateRefreshToken(findUser);
    findUser.refreshToken = newRefreshToken;
    await findUser.save();

    return res.status(200).json({
      status: true,
      details: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Invalid or expired refresh token",
    });
  }
};

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  userInfo,
  userChangePassword,
  getRefreshToken,
};
