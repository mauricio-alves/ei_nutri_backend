const AdminModel = require("../models/Admin.model");

async function attachCurrentAdmin(req, res, next) {
  try {
    const loggedInAdmin = req.auth;
    console.log(loggedInAdmin);

    const admin = await AdminModel.findOne(
      { _id: loggedInAdmin._id },
      { passwordHash: 0 }
    );

    if (!admin) {
      return res.status(400).json({ message: "This user does not exist." });
    }

    req.currentAdmin = admin;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = attachCurrentAdmin;
