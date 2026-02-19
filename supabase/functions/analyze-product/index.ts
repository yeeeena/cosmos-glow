const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a beauty product photography expert. Analyze this product image and return ONLY a JSON object with these exact fields:

{
  "container_color": "1~2 color words in English (e.g. dark amber, frosted white, pale pink)",
  "container_material": "glass or plastic or metal or other",
  "container_type": "pump bottle or cream jar or tube or spray or dropper or other",
  "product_category": "shampoo or body wash or cleanser or serum or ampoule or moisturizer or cream or mask or scrub or toner or perfume or body oil or other",
  "selected_texture": "one of: foam_lather / cream_swirl / gel_oil_drip / crystal_grain / silk_drape / water_drops / mochi_stretch",
  "texture_reason_ko": "이 텍스처를 선택한 이유 한 문장 (한국어)"
}

Texture selection rules:
- foam_lather: shampoo, body wash, cleansing foam (foamy products)
- cream_swirl: moisturizer, cream, hair mask (thick creamy products)
- gel_oil_drip: serum, ampoule, facial oil (transparent fluid products)
- crystal_grain: scrub, peeling gel (exfoliating granule products)
- silk_drape: perfume, body oil, luxury skincare (high-end editorial mood)
- water_drops: toner, essence, mist (lightweight watery products)
- mochi_stretch: cleansing cream, clay mask (thick viscous sticky products)

Return ONLY the JSON. No markdown, no explanation.`;

const TEXTURE_PHRASES: Record<string, string> = {
  foam_lather: "rich foam lather texture surrounding the product",
  cream_swirl: "luxurious cream swirl texture flowing around the product",
  gel_oil_drip: "transparent gel oil drip texture cascading beside the product",
  crystal_grain: "crystalline grain texture scattered around the product",
  silk_drape: "soft silk drape texture elegantly wrapping near the product",
  water_drops: "fresh water drops texture glistening on and around the product",
  mochi_stretch: "viscous mochi stretch texture pulled from the product",
};

const BACKGROUND_PHRASES: Record<string, string> = {
  foam_lather: "on a clean wet surface with subtle water ripples",
  cream_swirl: "on a smooth marble surface with soft gradient background",
  gel_oil_drip: "on a reflective glass surface with minimal background",
  crystal_grain: "on a textured stone surface with natural tones",
  silk_drape: "on a draped fabric surface with warm ambient light",
  water_drops: "on a frosted glass surface with cool-toned background",
  mochi_stretch: "on a smooth matte surface with neutral backdrop",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this beauty product image." },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown fences if present)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(jsonStr);

    const texturePh = TEXTURE_PHRASES[analysis.selected_texture] || TEXTURE_PHRASES.cream_swirl;
    const bgPh = BACKGROUND_PHRASES[analysis.selected_texture] || BACKGROUND_PHRASES.cream_swirl;

    const generationPrompt = `TXTING style beauty product photography, ${analysis.container_color} ${analysis.container_material} ${analysis.container_type} ${analysis.product_category}, ${texturePh}, ${bgPh}, soft studio lighting, clean editorial product photography, high detail`;

    return new Response(
      JSON.stringify({ analysis, generationPrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-product error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
