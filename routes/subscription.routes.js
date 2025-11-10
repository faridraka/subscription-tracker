import { Router } from "express";

import authorize from "../middlewares/auth.middleware.js";
import { cancelledSubscription, createSubscription, deleteSubscription, getSubscription, getSubscriptions, getUpcomingRenewals, getUsersSubscriptions, updateSubscription } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

subscriptionRouter.get('/', getSubscriptions);

subscriptionRouter.get('/:id', authorize, getSubscription);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', authorize, updateSubscription);

subscriptionRouter.delete('/:id', authorize, deleteSubscription);

subscriptionRouter.get('/user/:id', authorize, getUsersSubscriptions);

subscriptionRouter.put('/:id/cancel', authorize, cancelledSubscription);

export default subscriptionRouter;