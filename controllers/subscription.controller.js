import Subscription from "../models/subscription.model.js";

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const allowedUpdates = [
      "name",
      "price",
      "currency",
      "frequency",
      "category",
      "paymentMethod",
    ];

    const updates = Object.keys(req.body);

    if (updates.length === 0) {
      const error = new Error("No valid fields provided for update");
      error.statusCode = 400;
      throw error;
    }

    const invalidFields = updates.filter(
      (field) => !allowedUpdates.includes(field)
    );

    if (invalidFields.length > 0) {
      const error = new Error(
        `Invalid updates detected: ${invalidFields.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to update this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    updates.forEach((key) => {
      subscription[key] = req.body[key];
    });

    if (updates.includes("frequency")) {
      const renewalPeriods = {
        daily: 1,
        weekly: 7,
        monthly: 30,
        yearly: 365,
      };

      const newRenewalDate = new Date(subscription.startDate);
      newRenewalDate.setDate(
        newRenewalDate.getDate() + renewalPeriods[subscription.frequency]
      );

      subscription.renewalDate = newRenewalDate;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to update this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    await Subscription.findByIdAndDelete(subscription._id);

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersSubscriptions = async (req, res, next) => {
  try {
    if (req.user.id.toString() !== req.params.id) {
      const error = new Error("You are not authorized to access this account");
      error.statusCode = 403;
      throw error;
    }

    const subscription = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const cancelledSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error(
        "You are not authorized to update this subscription"
      );
      error.statusCode = 403;
      throw error;
    }

    subscription.status = "cancelled";
    await subscription.save();

    res
      .status(200)
      .json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcomingSubscriptions = await Subscription.find({
      user: userId,
      status: "active",
      renewalDate: { $gte: now, $lte: nextWeek },
    }).sort({ renewalDate: 1 });

    if (upcomingSubscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No upcoming renewals within the next 7 days",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      count: upcomingSubscriptions.length,
      data: upcomingSubscriptions,
    });
  } catch (error) {
    next(error);
  }
};