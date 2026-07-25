import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const getSettings = async () => {
  const { data } = await axiosPublic.get("/settings");
  return data;
};

export const updateSettings = async ({ siteName, logo }) => {
  const body = {};
  if (siteName) body.siteName = siteName;
  if (logo) body.logo = logo;

  const { data } = await axiosSecure.patch("/settings", body);
  return data;
};
