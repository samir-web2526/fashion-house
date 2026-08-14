import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

const useOrders = () => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await axios.get("/orders");
      return data;
    },
  });
};

export default useOrders;