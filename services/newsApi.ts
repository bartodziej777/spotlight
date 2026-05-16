const API_KEY = process.env.EXPO_PUBLIC_GNEWS_API_KEY;
const BASE_URL = "https://gnews.io/api/v4";

export const fetchNews = async (query: string) => {
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&country=pl&max=10&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.errors) {
      console.error("Błąd GNews API:", data.errors);
      return [];
    }

    return data.articles || [];
  } catch (error) {
    console.error("Błąd sieci:", error);
    return [];
  }
};
