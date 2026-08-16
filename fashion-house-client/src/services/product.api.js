import axiosPublic from "../utils/axiosPublic";
import axiosSecure from "../utils/axiosSecure";

export const getProducts = async (params = {}) => {
  const { data } = await axiosPublic.get("/products", { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await axiosPublic.get(`/products/${id}`);
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await axiosSecure.post("/products", payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await axiosSecure.patch(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await axiosSecure.delete(`/products/${id}`);
  return data;
};
