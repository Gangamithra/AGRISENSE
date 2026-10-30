
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function getMarketPrices(crop) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase configuration is missing.");
  }

  if (!["Banana", "Coconut"].includes(crop)) {
    throw new Error("Unsupported crop selected.");
  }

  const endpoint = new URL(
    `${SUPABASE_URL}/functions/v1/market-prices`
  );

  endpoint.searchParams.set("crop", crop);

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || result.message || "Unable to fetch market prices."
    );
  }

  if (!result.data || !Array.isArray(result.data.records)) {
    throw new Error("The market API returned an unexpected response.");
  }

  return {
    crop: result.crop,
    source: result.source,
    fetchedAt: result.fetchedAt,
    lastUpdated: result.data.updated_date,
    total: result.data.total,
    records: result.data.records,
  };
}
