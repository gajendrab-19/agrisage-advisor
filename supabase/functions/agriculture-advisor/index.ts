import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, crop, season, region } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Query is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Determine agent type based on query
    const agentType = determineAgentType(query);
    console.log(`Selected agent: ${agentType}`);

    // Step 2: Retrieve relevant documents from knowledge base (RAG)
    const relevantDocs = await retrieveRelevantDocuments(
      supabase,
      query,
      agentType,
      crop,
      season,
      region
    );
    console.log(`Retrieved ${relevantDocs.length} relevant documents`);

    // Step 3: Build context for LLM
    const context = buildContext(relevantDocs, query, crop, season, region);

    // Step 4: Generate response using Lovable AI (Gemini 2.5 Flash)
    const aiResponse = await generateAIResponse(context, query, agentType);

    // Step 5: Log query and response to database
    await logQuery(supabase, query, crop, season, region, agentType, aiResponse);

    return new Response(
      JSON.stringify({
        agent: getAgentName(agentType),
        response: aiResponse,
        confidence: calculateConfidence(relevantDocs.length),
        documentsRetrieved: relevantDocs.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in agriculture-advisor:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Agent selection logic (multi-agent routing)
function determineAgentType(query: string): string {
  const queryLower = query.toLowerCase();

  // Crop-related keywords
  if (
    queryLower.includes("crop") ||
    queryLower.includes("cultivation") ||
    queryLower.includes("plant") ||
    queryLower.includes("grow") ||
    queryLower.includes("harvest") ||
    queryLower.includes("variety") ||
    queryLower.includes("seed") ||
    queryLower.includes("npk")
  ) {
    return "crop_advisor";
  }

  // Soil-related keywords
  if (
    queryLower.includes("soil") ||
    queryLower.includes("ph") ||
    queryLower.includes("nitrogen") ||
    queryLower.includes("phosphorus") ||
    queryLower.includes("potassium") ||
    queryLower.includes("nutrient") ||
    queryLower.includes("deficiency") ||
    queryLower.includes("organic matter") ||
    queryLower.includes("fertilizer")
  ) {
    return "soil_expert";
  }

  // Scheme-related keywords
  if (
    queryLower.includes("scheme") ||
    queryLower.includes("pm-kisan") ||
    queryLower.includes("pmfby") ||
    queryLower.includes("insurance") ||
    queryLower.includes("subsidy") ||
    queryLower.includes("government") ||
    queryLower.includes("kcc") ||
    queryLower.includes("credit") ||
    queryLower.includes("health card")
  ) {
    return "scheme_finder";
  }

  // Productivity-related keywords
  if (
    queryLower.includes("productivity") ||
    queryLower.includes("yield") ||
    queryLower.includes("ipm") ||
    queryLower.includes("pest") ||
    queryLower.includes("irrigation") ||
    queryLower.includes("drip") ||
    queryLower.includes("rotation") ||
    queryLower.includes("precision")
  ) {
    return "productivity_advisor";
  }

  return "general";
}

// RAG: Retrieve relevant documents from knowledge base
async function retrieveRelevantDocuments(
  supabase: any,
  query: string,
  agentType: string,
  crop?: string,
  season?: string,
  region?: string
): Promise<any[]> {
  const queryWords = query
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 3);

  let category = "general";
  if (agentType === "crop_advisor") category = "crop";
  else if (agentType === "soil_expert") category = "soil";
  else if (agentType === "scheme_finder") category = "scheme";
  else if (agentType === "productivity_advisor") category = "productivity";

  // Build query
  let dbQuery = supabase.from("knowledge_base").select("*");

  // Filter by category if specific agent
  if (category !== "general") {
    dbQuery = dbQuery.eq("category", category);
  }

  // Filter by crop if provided
  if (crop && crop !== "Other") {
    dbQuery = dbQuery.or(`crop_name.eq.${crop},crop_name.is.null`);
  }

  // Filter by season if provided
  if (season) {
    dbQuery = dbQuery.or(`season.eq.${season},season.is.null`);
  }

  // Filter by region if provided
  if (region && region !== "Pan-India") {
    dbQuery = dbQuery.or(`region.eq.${region},region.eq.Pan-India,region.is.null`);
  }

  // Execute query
  const { data, error } = await dbQuery.limit(5);

  if (error) {
    console.error("Error retrieving documents:", error);
    return [];
  }

  // If no results with filters, try without filters
  if (!data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("category", category)
      .limit(5);
    return fallbackData || [];
  }

  return data || [];
}

// Build context for LLM from retrieved documents
function buildContext(
  documents: any[],
  query: string,
  crop?: string,
  season?: string,
  region?: string
): string {
  let context = "# Agriculture Knowledge Base Context\n\n";

  if (crop) context += `Crop: ${crop}\n`;
  if (season) context += `Season: ${season}\n`;
  if (region) context += `Region: ${region}\n`;
  context += `\nUser Query: ${query}\n\n`;

  context += "## Relevant Information from Knowledge Base:\n\n";

  documents.forEach((doc, index) => {
    context += `### Document ${index + 1}: ${doc.title}\n`;
    context += `Category: ${doc.category}\n`;
    if (doc.crop_name) context += `Crop: ${doc.crop_name}\n`;
    if (doc.season) context += `Season: ${doc.season}\n`;
    if (doc.region) context += `Region: ${doc.region}\n`;
    context += `Content: ${doc.content}\n\n`;
  });

  return context;
}

// Generate AI response using Lovable AI (Gemini 2.5 Flash)
async function generateAIResponse(
  context: string,
  query: string,
  agentType: string
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const systemPrompt = getAgentSystemPrompt(agentType);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${context}\n\nBased on the above knowledge base information, please answer the following query:\n${query}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI API error:", response.status, errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Agent-specific system prompts
function getAgentSystemPrompt(agentType: string): string {
  const basePrompt =
    "You are an expert AI Agriculture Advisor. Provide accurate, practical, and helpful advice to farmers based on the knowledge base provided. Be concise but comprehensive.";

  const agentPrompts: Record<string, string> = {
    crop_advisor:
      basePrompt +
      " You specialize in crop cultivation practices, including planting, growing, harvesting, and crop management. Focus on crop-specific NPK requirements, growing conditions, varieties, and best practices.",
    soil_expert:
      basePrompt +
      " You specialize in soil health, nutrient management, pH levels, and fertilizer recommendations. Help farmers understand soil deficiencies and how to improve soil quality.",
    scheme_finder:
      basePrompt +
      " You specialize in government agricultural schemes, subsidies, insurance, and farmer welfare programs. Explain eligibility, benefits, registration process, and documentation.",
    productivity_advisor:
      basePrompt +
      " You specialize in farming productivity, including IPM (Integrated Pest Management), irrigation techniques, crop rotation, and modern agricultural technologies.",
    general:
      basePrompt +
      " You provide general agricultural advice covering all aspects of farming.",
  };

  return agentPrompts[agentType] || agentPrompts.general;
}

// Log query and response to database
async function logQuery(
  supabase: any,
  query: string,
  crop: string | undefined,
  season: string | undefined,
  region: string | undefined,
  agentType: string,
  response: string
): Promise<void> {
  try {
    await supabase.from("queries").insert({
      query_text: query,
      crop_name: crop || null,
      season: season || null,
      region: region || null,
      agent_type: agentType,
      response: response,
      confidence_score: 0.85, // Placeholder
      processing_time_ms: 0, // Placeholder
    });
  } catch (error) {
    console.error("Error logging query:", error);
  }
}

// Helper functions
function getAgentName(agentType: string): string {
  const names: Record<string, string> = {
    crop_advisor: "Crop Advisor Agent",
    soil_expert: "Soil Expert Agent",
    scheme_finder: "Scheme Finder Agent",
    productivity_advisor: "Productivity Advisor Agent",
    general: "General Agriculture Agent",
  };
  return names[agentType] || "General Agriculture Agent";
}

function calculateConfidence(docsCount: number): number {
  if (docsCount >= 3) return 0.9;
  if (docsCount >= 2) return 0.8;
  if (docsCount >= 1) return 0.7;
  return 0.5;
}
