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
const { selfAuthMiddleware } = require("../../middleware/selfauth.middleware");
const authRouter = express.Router();

//api routes
authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);
authRouter.post("/logout",authMiddleware,selfAuthMiddleware,userLogout);
authRouter.get(`/me/:id`,authMiddleware,selfAuthMiddleware,userInfo);
authRouter.patch(`/change-password/:id`,authMiddleware,selfAuthMiddleware,userChangePassword);

authRouter.post("/refreshToken",authMiddleware,selfAuthMiddleware,getRefreshToken);

module.exports = { authRouter };
