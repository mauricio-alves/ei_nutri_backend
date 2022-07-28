const router = require("express").Router();
const bcrypt = require("bcrypt");
const UserModel = require("../models/User.model");
const AdminModel = require("../models/Admin.model");

const generateToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAdmin = require("../middlewares/isAdmin");

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

    const createdUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    delete createdUser._doc.passwordHash;
    delete createdUser._doc.__v;

    return res
      .status(201)
      .json({ message: "User created with success!", createdUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "Wrong password or email." });
    }

    if (user.isActive === false) {
      await UserModel.findOneAndUpdate(
        { email: email },
        { isActive: true },
        { runValidators: true, new: true }
      );
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      delete user._doc.__v;
      const token = generateToken(user);

      return res.status(200).json({
        token: token,
        user: { ...user._doc },
      });
    } else {
      return res.status(400).json({ message: "Wrong password or email." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// READ USER DETAILS
router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedUser = req.currentUser;

    if (!loggedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = await UserModel.findOne({ _id: loggedUser._id })
      .populate("nutritionists", { passwordHash: 0, __v: 0, patients: 0 })
      .populate("reviews");

    delete user._doc.passwordHash;
    delete user._doc.__v;

    return res.status(200).json({ message: "User founded!", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(200).json(req.currentUser);
});

// UPDATE USER PROFILE
router.patch("/update-profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedUser = req.currentUser;

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: loggedUser._id },
      { ...req.body },
      { runValidators: true, new: true }
    );

    delete updatedUser._doc.passwordHash;
    delete updatedUser._doc.__v;

    return res
      .status(200)
      .json({ message: "User updated with success!", updatedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// PAGE WITH A LIST OF NUTRITIONISTS TO CHOOSE
router.get("/catalog", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedUser = req.currentUser;

    const allNutris = await AdminModel.find(
      {},
      { passwordHash: 0, __v: 0, patients: 0 }
    );

    return res.status(200).json({
      message: "Success! Here is the list of nutritionists:",
      allNutris,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// PAGE TO SEE DE NUTRITIONIST DETAILS
router.get(
  "/nutri-profile/:adminId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedUser = req.currentUser;
      const { adminId } = req.params;

      const nutri = await AdminModel.find(
        { _id: adminId },
        { passwordHash: 0, __v: 0, patients: 0 }
      );

      return res.status(200).json({
        message: "Success! Here is the profile of the selected nutritionist:",
        nutri,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

// PAGE TO ADD THE NUTRITIONIST AND CREATE THE APPOINTMENT
router.patch(
  "/nutri-added/:userId/:adminId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { userId, adminId } = req.params;

      await UserModel.findOneAndUpdate(
        { _id: userId },
        { $push: { nutritionist: adminId } },
        { runValidators: true }
      );

      await AdminModel.findOneAndUpdate(
        { _id: adminId },
        { $push: { patients: userId } },
        { runValidators: true }
      );

      return res
        .status(200)
        .json({ message: "Nutritionist added with success!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

// PAGE TO REMOVE THE NUTRITIONIST
router.patch(
  "/nutri-removed/:userId/:adminId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { userId, adminId } = req.params;

      await UserModel.updateOne(
        { _id: userId },
        { $pull: { nutritionist: adminId } }
      );

      await AdminModel.updateOne(
        { _id: adminId },
        { $pull: { patients: userId } }
      );

      return res
        .status(200)
        .json({ message: "Nutritionist removed with success!" });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

// SOFT DELETE
router.delete(
  "/disable-profile",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const disabledUser = await UserModel.findOneAndUpdate(
        { _id: req.currentUser._id },
        { isActive: false, disabledOn: Date.now() },
        { runValidators: true, new: true }
      );

      delete disabledUser._doc.passwordHash;
      delete disabledUser._doc.__v;

      return res
        .status(200)
        .json({ message: "User deleted with success!", disabledUser });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

module.exports = router;
