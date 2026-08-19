import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const getSettings = async () => {
  const { data } = await axiosPublic.get("/settings");
  return data;
};

export const updateSettings = async ({ siteName, logo, contactEmail, contactPhone, address, googleMapLink }) => {
  const body = {};
  if (siteName) body.siteName = siteName;
  if (logo) body.logo = logo;
  if (contactEmail !== undefined) body.contactEmail = contactEmail;
  if (contactPhone !== undefined) body.contactPhone = contactPhone;
  if (address !== undefined) body.address = address;
  if (googleMapLink !== undefined) body.googleMapLink = googleMapLink;

  const { data } = await axiosSecure.patch("/settings", body);
  return data;
};
