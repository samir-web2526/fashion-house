import { useEffect } from "react";
import useSettings from "./useSettings";

export default function useFavicon() {
  const { logo } = useSettings();

  useEffect(() => {
    if (!logo) return;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = logo;
  }, [logo]);
}
