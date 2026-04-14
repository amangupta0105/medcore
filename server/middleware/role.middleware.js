const roleMiddleware = (acceptedRoles) => async (req, res, next) => {
    
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const giveAccess = acceptedRoles.includes(req.user.role);

  if (!giveAccess) {
    return res.status(403).json({ message: "Forbidden: You do not have the necessary permissions" });
  }

  next();
};

module.exports = { roleMiddleware };
