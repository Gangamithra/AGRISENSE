
import { supabase } from "../lib/supabase";

export async function getDiseaseTreatments(crop, disease, language = "en") {
  const normalizedCrop =
    crop.toLowerCase() === "banana" ? "Banana" :
    crop.toLowerCase() === "coconut" ? "Coconut" :
    crop;

  const normalizedDisease = disease.trim();

  async function fetchByLanguage(selectedLanguage) {
    const { data, error } = await supabase
      .from("disease_treatments")
      .select("*")
      .ilike("crop", normalizedCrop)
      .ilike("disease", normalizedDisease)
      .eq("language", selectedLanguage)
      .eq("is_verified", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  }

  try {
    const records = await fetchByLanguage(language);

    if (records.length > 0) {
      return { records, fallback: false };
    }

    if (language === "ta") {
      const englishRecords = await fetchByLanguage("en");

      return {
        records: englishRecords,
        fallback: englishRecords.length > 0
      };
    }

    return { records: [], fallback: false };

  } catch (error) {
    console.error("Treatment fetch error:", error.message);
    throw new Error("Unable to load treatment recommendations.");
  }
}
