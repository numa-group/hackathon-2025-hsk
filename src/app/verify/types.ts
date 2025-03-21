// Response schema types for Gemini API
export interface ResponseSchema {
  type: string;
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

export interface SchemaProperty {
  type: string;
  description?: string;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  enum?: string[];
}

// Verification response types
export interface VerificationResult {
  id: string;
  description: string;
  status: "verified" | "not present" | "uncertain";
}

export interface VerificationResponse {
  verification_results: VerificationResult[];
  recommendations?: string[];
  additional_observations?: string[];
}
