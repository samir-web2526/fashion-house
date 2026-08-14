import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

const useProducts = () => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get("/products");
      return data;
    },
  });
};

export default useProducts;