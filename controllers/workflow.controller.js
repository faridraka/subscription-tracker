import { createRequire } from 'module'
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import dayjs from 'dayjs';

import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js';

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async(context) => {
  const { subscriptionId } = context.requestPayload;

  const subscription = await fetchSubscription(context, subscriptionId);

  if(!subscription || subscription.status !== 'active') return;

  const renewalDate = dayjs(subscription.renewalDate);

  if(renewalDate.isBefore(dayjs())){
    console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopped workflow`);
    return;
  }

  for(const dayBefore of REMINDERS){
    const reminderDate = renewalDate.subtract(dayBefore, 'day');

    if(reminderDate.isAfter(dayjs())){
      await sleepUntilReminder(context, `${dayBefore} days before reminder`, reminderDate);
    }

    if(dayjs().isSame(reminderDate,'day')){
      await triggerReminder(context, `${dayBefore} days before reminder`, subscription);
    }
  }
})

const fetchSubscription = async(context, subscriptionId) => {
  return await context.run('get subscription', async() => {
    return Subscription.findById(subscriptionId).populate('user', 'name email');
  });
}

const sleepUntilReminder = async(context, label, date) => {
  console.log(`Sleeping until ${label} at ${date}.`);
  await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async(context, label, subscription) => {
  return await context.run(label, () => {
    console.log(`Triggering ${label}`);
    
    sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription
    })
  })
}