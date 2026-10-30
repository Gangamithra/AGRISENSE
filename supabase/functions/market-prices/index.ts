
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const RESOURCE_URL =
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req) => {
      if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
      }

      if (req.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405);
      }

      const apiKey = Deno.env.get("DATA_GOV_IN_API_KEY");

      if (!apiKey) {
        return jsonResponse(
          { error: "Market data API key is not configured" },
          500,
        );
      }

      const incomingUrl = new URL(req.url);
      const crop = incomingUrl.searchParams.get("crop") || "Banana";
      const district = incomingUrl.searchParams.get("district");
      const market = incomingUrl.searchParams.get("market");

      if (!["Banana", "Coconut"].includes(crop)) {
        return jsonResponse(
          { error: "Crop must be Banana or Coconut" },
          400,
        );
      }

      const apiUrl = new URL(RESOURCE_URL);

      apiUrl.searchParams.set("api-key", apiKey);
      apiUrl.searchParams.set("format", "json");
      apiUrl.searchParams.set("limit", "100");
      apiUrl.searchParams.set("filters[state.keyword]", "Tamil Nadu");
      apiUrl.searchParams.set("filters[commodity]", crop);

      if (district) {
        apiUrl.searchParams.set("filters[District]", district);
      }

      if (market) {
        apiUrl.searchParams.set("filters[Market]", market);
      }

      try {
        const response = await fetch(apiUrl.toString(), {
          headers: { Accept: "application/json" },
        });

        const responseText = await response.text();

        if (!response.ok) {
          return jsonResponse(
            {
              error: "The government market data service returned an error",
              upstreamStatus: response.status,
              details: responseText.slice(0, 500),
            },
            502,
          );
        }

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          return jsonResponse(
            { error: "The government API returned an invalid response" },
            502,
          );
        }

        return jsonResponse({
          source: "data.gov.in",
          resourceId: "9ef84268-d588-465a-a308-a864a43d0070",
          fetchedAt: new Date().toISOString(),
          crop,
          district,
          market,
          data: result,
        });
      } catch {
        return jsonResponse(
          { error: "Unable to connect to the government market data service" },
          502,
        );
      }
    },
  ),
};
