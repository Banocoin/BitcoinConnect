import axios from "axios";

const notifications: Map<string, Set<string>> = new Map();

export const setNotification = (topic: string, webhook: string) => {
  const isExist = notifications.get(topic);
  if (isExist) {
    isExist.add(webhook);
  } else {
    notifications.set(topic, new Set([webhook]));
  }
};
export const getNotification = (topic: string) => notifications.get(topic);

export const pushNotification = (topic: string) => {
  const notifications = getNotification(topic);
  notifications &&
    notifications.forEach(webhook => axios.post(webhook, { topic }));
};
