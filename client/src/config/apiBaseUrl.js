const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://fd-saathi.onrender.com/api";

export default API_BASE_URL;
