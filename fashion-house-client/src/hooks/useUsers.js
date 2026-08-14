import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

const useUsers = () => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get("/users");
      return data;
    },
  });
};

export default useUsers;