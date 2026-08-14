import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

const useProfile = () => {
  const axios = useAxios();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await axios.get("/users/profile");
      return data;
    },
  });
};

export default useProfile;