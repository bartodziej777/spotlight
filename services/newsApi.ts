export const fetchNews = async (query: string) => {
  const API_KEY = process.env.EXPO_PUBLIC_GNEWS_API_KEY;
  const BASE_URL = "https://gnews.io/api/v4";

  // Dodajemy parametr 'in' i upewniamy się, że lang i country są na początku
  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&lang=pl&country=pl&max=10&apikey=${API_KEY}`;

  console.log("Wywołuję URL:", url); // Skopiuj ten link z konsoli i wklej do przeglądarki, żeby sprawdzić co zwraca "gołe" API

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    return [];
  }
};
