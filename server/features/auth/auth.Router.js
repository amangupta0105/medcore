const express = require("express");
const {
  userRegister,
  userLogin,
  userLogout,
  userInfo,
  userChangePassword,
  getRefreshToken,
} = require("./auth.Controller");
const { authMiddleware } = require("../../middleware/auth.middleware");
const authRouter = express.Router();

//api routes
authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);
authRouter.post("/logout", authMiddleware, userLogout);
authRouter.get(`/me`, authMiddleware, userInfo);
authRouter.patch(`/change-password`, authMiddleware, userChangePassword);
authRouter.post("/refreshToken", getRefreshToken);

module.exports = { authRouter };
