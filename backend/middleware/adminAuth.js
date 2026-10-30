
const adminAuth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];

  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({
      success: false,
      message: "Admin key is not configured."
    });
  }

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Admin access required."
    });
  }

  next();
};

module.exports = adminAuth;
