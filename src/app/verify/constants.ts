const GEMINI_API_KEY = process.env.GEMINI_API_KEY_NUMA;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required.");
}

export const constants = {
  GEMINI_API_KEY,
};
