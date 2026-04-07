require("dotenv").config();
const { User } = require("../../features/users/user.Schema.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const ACCESS_KEY = process.env.ACCESS_KEY;
const REFRESH_KEY = process.env.REFRESH_KEY;

const userRegister = async (req, res) => {
  const { full_name, email, password, phone, role } = req.body;
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
      return res.status(501).json({
        message: "Error in creating new User",
      });
    }

    const access_token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      ACCESS_KEY,
      { expiresIn: "15m" },
    );
    const refresh_token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      REFRESH_KEY,
      { expiresIn: "7d" },
    );

    newUser.refreshToken = refresh_token;
    await newUser.save();
    return res.status(201).json({
      message: "User created succesfully",
      id: newUser.id,
      access_token: access_token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    console.log(error.code);
    if (error.code == 11000) {
      return res.status(501).json({
        message: "Email already exists!",
      });
    }

    return res.status(501).json({
      message: "Error in creating new user",
      error: error.message,
    });
  }
};
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const compare_password = await bcrypt.compare(password, findUser.password);
    if (!compare_password) {
      return res.status(401).json({
        message: "Password is wrong",
      });
    }
    const access_token = jwt.sign(
      { id: findUser.id, role: findUser.role },
      ACCESS_KEY,
      { expiresIn: "15m" },
    );
    const refresh_token = jwt.sign(
      { id: findUser.id, role: findUser.role },
      REFRESH_KEY,
      { expiresIn: "7d" },
    );
    findUser.refreshToken = refresh_token;
    await findUser.save();

    return res.status(200).json({
      message: "Succesfully logged in",
      id: findUser.id,
      access_token,
      refresh_token,
    });
  } catch (error) {
    return res.status(501).json({
      message: "Error in creating new user",
      error: error.message,
    });
  }
};
const userLogout = async (req, res) => {
  const userId = req.user.id;
  const findUser = await User.findById(userId);
  if (!findUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  findUser.refreshToken = null;
  await findUser.save();
  return res.status(200).json({
    message: "Succesfully Logged out",
  });
};
const userInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const findUser = await User.findById(id).select("-password");
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User information found",
      deatils: findUser,
    });
  } catch (error) {
    return res.status(501).json({
      message: "Error in finding user",
      error: error.message,
    });
  }
};
const userChangePassword = async (req, res) => {
  const { id } = req.params;
  const { current_password, new_password } = req.body;
  const hashedPassword = await bcrypt.hash(new_password, saltRounds);
  const findUser = await User.findById(id);
  if (!findUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  const compare_password = await bcrypt.compare(
    current_password,
    findUser.password,
  );
  if (!compare_password) {
    return res.status(401).json({
      message: "Password is wrong",
    });
  }

  const updatePassword = await User.findByIdAndUpdate(findUser.id, {
    password: hashedPassword,
  });
  return res.status(200).json({
    message: "Password updated succesfully",
    id: updatePassword.id,
  });
};
const getRefreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token required",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_KEY);

    const findUser = await User.findById(decoded.id);

    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (findUser.refreshToken !== refreshToken) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = jwt.sign(
      { id: findUser.id, role: findUser.role },
      ACCESS_KEY,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      access_token: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({
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
