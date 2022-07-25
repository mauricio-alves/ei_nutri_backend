const router = require("express").Router();

const UserModel = require("../models/User.model");
const AdminModel = require("../models/Admin.model");
const ReviewModel = require("../models/Review.model");

const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

// CREATE A REVIEW AND ADDING TO A NUTRITIONIST
router.patch(
  "/review-added/:userId/:adminId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { userId, adminId } = req.params;

      const newReview = await ReviewModel.create(req.body);

      await UserModel.findOneAndUpdate(
        { _id: userId },
        { $push: { review: newReview } },
        { runValidators: true }
      );

      await AdminModel.findOneAndUpdate(
        { _id: adminId },
        { $push: { reviews: newReview } },
        { runValidators: true }
      );

      return res
        .status(200)
        .json({ message: "Review created and added with success!", newReview });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);
// UPDATE THE REVIEW
router.patch(
  "/edit-review/:reviewId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { reviewId } = req.params;

      const updatedReview = await ReviewModel.findOneAndUpdate(
        { _id: reviewId },
        { ...req.body },
        { runValidators: true, new: true }
      );

      return res
        .status(200)
        .json({ message: "Review updated with success!", updatedReview });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

// DELETE REVIEW
router.delete(
  "/delete/:reviewId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      ReviewModel.deleteOne({ _id: reviewId });

      await UserModel.updateOne(
        { review: reviewId },
        { $pull: { review: reviewId } }
      );

      await AdminModel.updateOne(
        { review: reviewId },
        { $pull: { reviews: reviewId } }
      );

      return res.status(200).json({ message: "Review deleted with success!" });
    } catch (err) {
      console.log(err);

      return res.status(500).json(err);
    }
  }
);

module.exports = router;
