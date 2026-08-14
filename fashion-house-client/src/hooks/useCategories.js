import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

const useCategories = () => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get("/categories");
      return data;
    },
  });
};

export default useCategories;