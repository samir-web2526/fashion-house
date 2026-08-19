"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../services/settings.api";

const useSettings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  return {
    siteName: data?.siteName || "",
    logo: data?.logo || null,
    contactEmail: data?.contactEmail || "",
    contactPhone: data?.contactPhone || "",
    address: data?.address || "",
    googleMapLink: data?.googleMapLink || "",
    isLoading,
  };
};

export default useSettings;
