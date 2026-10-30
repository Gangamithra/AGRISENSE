
import { getDiseaseTreatments } from "./services/treatmentService";

async function testTreatments() {
  try {
    const treatments = await getDiseaseTreatments(
      "Coconut",
      "Stem Bleeding",
      "en"
    );

    console.log("Treatment records:", treatments);
    console.log("Number of records:", treatments.length);
  } catch (error) {
    console.error(error.message);
  }
}

testTreatments();
