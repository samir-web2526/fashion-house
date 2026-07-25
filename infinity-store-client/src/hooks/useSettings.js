import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../services/settings.api";

const useSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  return {
    siteName: data?.siteName || "",
    logo: data?.logo || "",
    isLoading,
  };
};

export default useSettings;
