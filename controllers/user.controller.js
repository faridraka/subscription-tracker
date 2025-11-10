import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowedUpdates = ["name", "password"];
    const updates = Object.keys(req.body);

    if(updates.length === 0) {
      const error = new Error("No valid fields provided for update");
      error.statusCode = 400;
      throw error;
    }

    const invalidFields = updates.filter((key) => !allowedUpdates.includes(key));

    if (invalidFields.length > 0) {
      const error = new Error(
        `Invalid updates detected: ${invalidFields.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user._id.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to update user"
      );
      error.statusCode = 403;
      throw error;
    }

    for (let key of updates) {
      if (key === "password") {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      } else {
        user[key] = req.body[key];
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
