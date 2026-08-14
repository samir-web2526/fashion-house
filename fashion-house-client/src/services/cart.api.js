import axiosSecure from "../utils/axiosSecure";

export const getCart = async () => {
  const { data } = await axiosSecure.get("/cart");
  return data;
};

export const addToCart = async (payload) => {
  const { data } = await axiosSecure.post("/cart", payload);
  return data;
};

export const updateCartItem = async (id, payload) => {
  const { data } = await axiosSecure.patch(`/cart/${id}`, payload);
  return data;
};

export const removeCartItem = async (id) => {
  const { data } = await axiosSecure.delete(`/cart/${id}`);
  return data;
};
