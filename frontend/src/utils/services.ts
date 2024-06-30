//@ts-nocheck comment
const API_KEY = process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY;

export const fetchStockData = async (symbol) => {
  console.log("function called");
  const response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}`
  );
  const data = await response.json();
  console.log(data);
  return data;
};
