import useFavicon from "./hooks/useFavicon";

export default function App({ children }) {
  useFavicon();
  return children;
}
