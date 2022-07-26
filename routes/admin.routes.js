const router = require("express").Router();
const bcrypt = require("bcrypt");
const AdminModel = require("../models/Admin.model");

const generateToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const attachCurrentAdmin = require("../middlewares/attachCurrentAdmin");
// const isAdmin = require("../middlewares/isAdmin");

const saltRounds = 10;

// SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/
      )
    ) {
      return res.status(400).json({
        message:
          "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdAdmin = await AdminModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    delete createdAdmin._doc.passwordHash;
    delete createdAdmin._doc.__v;

    return res
      .status(201)
      .json({ message: "Admin created with success!", createdAdmin });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminModel.findOne({ email: email });

    if (!admin) {
      return res.status(400).json({ message: "Wrong password or email." });
    }

    if (admin.isActive === false) {
      await AdminModel.findOneAndUpdate(
        { email: email },
        { isActive: true },
        { runValidators: true, new: true }
      );
    }

    if (await bcrypt.compare(password, admin.passwordHash)) {
      delete admin._doc.passwordHash;
      delete admin._doc.__v;
      const token = generateToken(admin);

      return res.status(200).json({
        token: token,
        user: { ...admin._doc },
      });
    } else {
      return res.status(400).json({ message: "Wrong password or email." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// READ ADMIN DETAILS
router.get("/profile", isAuth, attachCurrentAdmin, async (req, res) => {
  try {
    const loggedAdmin = req.currentAdmin;

    if (!loggedAdmin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const admin = await AdminModel.findOne({ _id: loggedAdmin._id })
      .populate("patients", { passwordHash: 0, __v: 0, nutritionist: 0 })
      .populate("reviews");

    delete admin._doc.passwordHash;
    delete admin._doc.__v;

    return res.status(200).json({ message: "Admin founded!", admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(200).json(req.currentAdmin);
});

// UPDATE ADMIN PROFILE
router.patch(
  "/update-profile",
  isAuth,
  attachCurrentAdmin,
  async (req, res) => {
    try {
      const loggedAdmin = req.currentAdmin;

      const updatedAdmin = await AdminModel.findOneAndUpdate(
        { _id: loggedAdmin._id },
        { ...req.body },
        { runValidators: true, new: true }
      );

      delete updatedAdmin._doc.passwordHash;
      delete updatedAdmin._doc.__v;

      return res
        .status(200)
        .json({ message: "Admin updated with success!", updatedAdmin });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

// PAGE TO SEE A PATIENT DETAILS
router.get("/:userId", isAuth, attachCurrentAdmin, async (req, res) => {});

// SOFT DELETE
router.delete(
  "/disable-profile",
  isAuth,
  attachCurrentAdmin,
  async (req, res) => {
    try {
      const disabledAdmin = await AdminModel.findOneAndUpdate(
        { _id: req.currentAdmin._id },
        { isActive: false, disabledOn: Date.now() },
        { runValidators: true, new: true }
      );

      delete disabledAdmin._doc.passwordHash;
      delete disabledAdmin._doc.__v;

      return res
        .status(200)
        .json({ message: "Admin deleted with success!", disabledAdmin });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

module.exports = router;
