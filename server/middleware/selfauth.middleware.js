const selfAuthMiddleware = (req, res, next) => {
  const userId =
    req.params.id ||
    req.body.id ||
    req.query.id;

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  if (userId !== req.user.id) {
    return res.status(403).json({
      message: "You are not authorized for this user",
    });
  }

  next();
};

module.exports ={selfAuthMiddleware}