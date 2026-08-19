import axios from "axios";
import { getApiUrl } from "./getApiUrl";

const axiosSecure = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosSecure;
