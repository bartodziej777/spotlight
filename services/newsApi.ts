const API_KEY = process.env.EXPO_PUBLIC_GNEWS_API_KEY;
const BASE_URL = "https://gnews.io/api/v4";

export const fetchNews = async (
  query: string = "general",
  lang: string = "pl",
) => {
  // query może być kategorią (np. business) lub dowolnym hasłem
  const url = `${BASE_URL}/top-headlines?category=${query}&lang=${lang}&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("GNews Error:", error);
    return [];
  }
};
