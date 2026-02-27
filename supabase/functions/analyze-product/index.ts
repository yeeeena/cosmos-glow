const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `You are a beauty product photography expert. Analyze this product image and return ONLY a JSON object:
{
  "container_color": "1~2 color words in English",
  "container_material": "glass or plastic or metal or other",
  "container_type": "pump bottle or cream jar or tube or spray or dropper or other",
  "product_category": "shampoo or body wash or cleanser or serum or ampoule or moisturizer or cream or mask or scrub or toner or perfume or body oil or other",
  "selected_texture": "one of: foam_lather / cream_swirl / gel_oil_drip / crystal_grain / silk_drape / water_drops / mochi_stretch",
  "texture_reason_ko": "이 텍스처를 선택한 이유 한 문장 (한국어)"
}

Texture rules:
- foam_lather: shampoo, body wash, cleansing foam
- cream_swirl: moisturizer, cream, hair mask
- gel_oil_drip: serum, ampoule, facial oil
- crystal_grain: scrub, peeling gel
- silk_drape: perfume, body oil, luxury skincare
- water_drops: toner, essence, mist
- mochi_stretch: cleansing cream, clay mask

Return ONLY the JSON. No markdown, no explanation.`;

const TEXTURE_PHRASES: Record<string, string> = {
  foam_lather:
    "entirely enveloped in billowing dense white foam forming a soft organic sculptural shape around the entire package, thick foam dripping down the sides in streams",
  cream_swirl:
    "with a generous peaked swirl of thick white cream texture piled on top of the open lid, rich whipped texture with soft peaks, cream radiating outward on the surface",
  gel_oil_drip:
    "with transparent gel oil dripping slowly from the pump head down all sides of the bottle in slow viscous streams, pooling in a glossy translucent puddle around the base",
  crystal_grain:
    "partially buried in and surrounded by chunky coarse sea salt crystal granules overflowing around it, warm amber liquid dripping from a glass ledge below",
  silk_drape:
    "placed on softly draped shiny silk satin fabric in complementary tones, the product rests on the flowing textile surface, elegant editorial still life",
  water_drops:
    "surrounded by floating transparent circular water droplets and a curling ribbon of clear gel liquid, pure white background, minimal editorial",
  mochi_stretch:
    "with thick stretchy mochi-textured cream being pulled upward by a wooden spatula stretching in a long viscous strand, hand holding spatula from above",
};

const BACKGROUND_PHRASES: Record<string, string> = {
  foam_lather: "soft grey gradient background",
  cream_swirl: "pure white reflective surface, clean studio background",
  gel_oil_drip: "soft blue-grey gradient background",
  crystal_grain: "warm beige-grey gradient background",
  silk_drape: "pastel complementary toned background",
  water_drops: "pure white background",
  mochi_stretch: "neutral soft grey background",
};

async function callLovableAI(body: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return { rateLimited: true, status: 429 };
    }
    if (response.status === 402) {
      return { rateLimited: true, status: 402 };
    }
    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  return { data: await response.json(), rateLimited: false };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, imageBase64, prompt, referenceImageBase64, referenceAnalysis } = body;

    console.log(`Action: ${action} started`);

    // ─── ACTION: analyze ───
    if (action === "analyze") {
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Ensure proper data URL format
      const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

      console.log("AI call: analyze started");
      const result = await callLovableAI({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
              {
                type: "text",
                text: "이 제품 이미지를 분석해주세요.",
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      console.log("AI call: analyze completed");

      if (result.rateLimited) {
        const msg =
          result.status === 429
            ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
            : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let content = result.data?.choices?.[0]?.message?.content || "";
      content = content.trim();
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let analysis;
      try {
        analysis = JSON.parse(content);
      } catch {
        console.error("JSON parse error:", content);
        return new Response(JSON.stringify({ error: "제품 분석에 실패했습니다. 다시 시도해주세요." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const texturePh = TEXTURE_PHRASES[analysis.selected_texture] || TEXTURE_PHRASES.cream_swirl;
      const bgPh = BACKGROUND_PHRASES[analysis.selected_texture] || BACKGROUND_PHRASES.cream_swirl;

      const generationPrompt = `TXTING style beauty product photography, ${analysis.container_color} ${analysis.container_material} ${analysis.container_type} ${analysis.product_category}, ${texturePh}, ${bgPh}, soft studio lighting, clean editorial product photography, high detail`;

      return new Response(JSON.stringify({ analysis, generationPrompt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: analyze-details ───
    if (action === "analyze-details") {
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

      const detailSystemPrompt = `You are a professional product photography planner.
Analyze this product image and determine the product category and recommend 3-5 detail shots that would best showcase this product.
Return ONLY a JSON object:
{
  "category": "product category in Korean (e.g. 무선 이어폰, 화장품, 스킨케어 등)",
  "details": [
    { "id": "unique-id", "label": "shot description in Korean", "defaultChecked": true },
    ...
  ]
}
Each detail shot should be specific to this product type. Use descriptive Korean labels.
Mark the top 3 most important shots as defaultChecked: true, others as false.
Return ONLY the JSON. No markdown, no explanation.`;

      console.log("AI call: analyze-details started");
      const result = await callLovableAI({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: detailSystemPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              { type: "text", text: "이 제품 이미지를 분석하고 최적의 상세컷을 추천해주세요." },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      console.log("AI call: analyze-details completed");

      if (result.rateLimited) {
        const msg =
          result.status === 429
            ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
            : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let content = result.data?.choices?.[0]?.message?.content || "";
      content = content.trim();
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let detailAnalysis;
      try {
        detailAnalysis = JSON.parse(content);
      } catch {
        console.error("Detail analysis JSON parse error:", content);
        return new Response(JSON.stringify({ error: "상세컷 분석에 실패했습니다. 다시 시도해주세요." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ detailRecommendation: detailAnalysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: analyze-reference ───
    if (action === "analyze-reference") {
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

      const refSystemPrompt = `You are a professional photography scene analyst.
Analyze this reference image and describe the background concept in detail.
Return ONLY a JSON object:
{
  "color_palette": "dominant colors and tones",
  "lighting": "lighting style and direction",
  "mood": "overall mood and atmosphere",
  "environment": "background environment description",
  "surface": "surface material the product should sit on"
}
Return ONLY the JSON. No markdown, no explanation.`;

      console.log("AI call: analyze-reference started");
      const result = await callLovableAI({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: refSystemPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              { type: "text", text: "Analyze this reference image." },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      console.log("AI call: analyze-reference completed");

      if (result.rateLimited) {
        const msg =
          result.status === 429
            ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
            : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let content = result.data?.choices?.[0]?.message?.content || "";
      content = content.trim();
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let refAnalysis;
      try {
        refAnalysis = JSON.parse(content);
      } catch {
        console.error("Reference analysis JSON parse error:", content);
        return new Response(JSON.stringify({ error: "레퍼런스 분석에 실패했습니다. 다시 시도해주세요." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ referenceAnalysis: refAnalysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: generate ───
    if (action === "generate") {
      if (!prompt) {
        return new Response(JSON.stringify({ error: "prompt is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Build aspect ratio instruction
      const aspectRatioMap: Record<string, string> = {
        "1:1": "square 1:1 aspect ratio",
        "9:16": "vertical portrait 9:16 aspect ratio",
        "16:9": "horizontal landscape 16:9 aspect ratio",
        "3:4": "vertical 3:4 aspect ratio",
        "4:3": "horizontal 4:3 aspect ratio",
      };
      const ratioInstruction = body.aspectRatio ? aspectRatioMap[body.aspectRatio] || "" : "";
      const finalPrompt = ratioInstruction ? `${prompt}, ${ratioInstruction}` : prompt;

      // Build prompt with reference analysis if available
      let effectivePrompt = finalPrompt;
      if (referenceAnalysis) {
        effectivePrompt = `ROLE:
You are a "Product Mockup Auto-Generation AI".
The user uploads ONE product image.
Preserve the product's label, typography, proportions, silhouette, and structural design exactly.
Only transform the background, lighting, and environment according to the style rules.

GLOBAL RULES (MANDATORY):
- Preserve brand logo and text exactly (no distortion, no replacement, no new typography)
- Do NOT generate new text or copywriting
- Do NOT modify product structure, materials, label layout, or proportions
- No literal fruit/food objects (macro textures allowed)
- No low-budget, home-shopping, flyer-style aesthetic
- Maintain photorealistic, ultra-clean, premium studio quality
- No props unless abstract and non-literal

Reference scene analysis:
- Color palette: ${referenceAnalysis.color_palette}
- Lighting: ${referenceAnalysis.lighting}
- Mood: ${referenceAnalysis.mood}
- Environment: ${referenceAnalysis.environment}
- Surface: ${referenceAnalysis.surface}

Composite the product image from Step 1 onto the reference image background.
Replace any product in the reference image with the Step 1 product image, using only the background from the reference.

Match the product's perspective, surface reflections, shadow direction and intensity
to the light sources in the background.
Reproduce all product label text and graphic elements sharply and without distortion.
The final result must look like a single cohesive photograph with physically consistent
lighting and material response throughout.${ratioInstruction ? ` ${ratioInstruction}` : ""}`;
      }

      // Build userContent with images
      const userContent: unknown[] = [];
      if (body.productImageBase64) {
        const prodUrl = body.productImageBase64.startsWith("data:")
          ? body.productImageBase64
          : `data:image/jpeg;base64,${body.productImageBase64}`;
        userContent.push({ type: "image_url", image_url: { url: prodUrl } });
      }
      if (referenceImageBase64) {
        const refUrl = referenceImageBase64.startsWith("data:")
          ? referenceImageBase64
          : `data:image/jpeg;base64,${referenceImageBase64}`;
        userContent.push({ type: "image_url", image_url: { url: refUrl } });
      }
      userContent.push({ type: "text", text: effectivePrompt });

      const result = await callLovableAI({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
        modalities: ["image", "text"],
        temperature: 1,
      });

      if (result.rateLimited) {
        const msg =
          result.status === 429
            ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
            : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract image from multimodal response
      let imageDataUri: string | null = null;
      const choices = result.data?.choices;
      const msgContent = choices?.[0]?.message?.content;

      console.log("Generate response type:", typeof msgContent, "isArray:", Array.isArray(msgContent));
      console.log("Generate response preview:", JSON.stringify(msgContent).slice(0, 500));

      // Check images array first (Lovable AI gateway format)
      const images = choices?.[0]?.message?.images;
      if (Array.isArray(images) && images.length > 0) {
        imageDataUri = images[0]?.image_url?.url || null;
      }

      // Fallback: check content array
      if (!imageDataUri && msgContent) {
        if (Array.isArray(msgContent)) {
          for (const part of msgContent) {
            if (part.type === "image_url" && part.image_url?.url) {
              imageDataUri = part.image_url.url;
              break;
            }
            if (part.type === "image" && part.image?.url) {
              imageDataUri = part.image.url;
              break;
            }
            if (part.inline_data) {
              imageDataUri = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
              break;
            }
          }
        } else if (typeof msgContent === "string" && msgContent.startsWith("data:")) {
          imageDataUri = msgContent;
        }
      }

      if (!imageDataUri) {
        console.error("No image in response. Full response:", JSON.stringify(result.data).slice(0, 2000));
        return new Response(JSON.stringify({ error: "이미지 생성에 실패했습니다. 다시 시도해주세요." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ imageDataUri }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: detect-color ───
    if (action === "detect-color") {
      const { productImageBase64 } = body;
      if (!productImageBase64) {
        return new Response(JSON.stringify({ error: "productImageBase64 is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prodUrl = productImageBase64.startsWith("data:")
        ? productImageBase64
        : `data:image/jpeg;base64,${productImageBase64}`;

      console.log("AI call: detect-color started");
      const result = await callLovableAI({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: prodUrl } },
              {
              type: "text",
                text: `Analyze this product image. Determine the product category and extract the dominant color of the product (liquid or packaging tone).
Return ONLY a JSON object:
{
  "detectedCategory": "BEAUTY" or "TECH" or "FOOD",
  "dominantColor": "1-2 word color description in English (e.g. coral pink, mint green, deep navy)",
  "backgroundHex": "#XXXXXX (the exact RGB hex code for an extremely light, near-white pastel tint derived from the dominant product color)",
  "backgroundTone": "very light near-white [color]-tinted studio background with bright white lighting"
}
The backgroundHex must be a specific hex color code (e.g. #F5E6E0, #E8F0E8, #E6E8F0).
It should be an extremely light, almost white pastel tint derived from the dominant product color.
The backgroundTone is a text description of the same color.
Both must represent the same color — a white studio background with just a subtle hint of the product color.
Return ONLY the JSON. No markdown, no explanation.`,
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      });

      console.log("AI call: detect-color completed");

      if (result.rateLimited) {
        const msg = result.status === 429
          ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
          : "크레딧이 부족합니다.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let content = result.data?.choices?.[0]?.message?.content || "";
      content = content.trim();
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let colorData;
      try {
        colorData = JSON.parse(content);
      } catch {
        console.error("detect-color JSON parse error:", content);
        return new Response(JSON.stringify({ error: "색상 감지에 실패했습니다." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(colorData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: analyze-main-shot ───
    if (action === "analyze-main-shot") {
      const { mainShotImageBase64 } = body;
      if (!mainShotImageBase64) {
        return new Response(JSON.stringify({ error: "mainShotImageBase64 is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const mainShotUrl = mainShotImageBase64.startsWith("data:")
        ? mainShotImageBase64
        : `data:image/jpeg;base64,${mainShotImageBase64}`;

      const moodPrompt = `You are a professional art director analyzing a product photo.
Analyze this image and return ONLY a JSON object:
{
  "lightingStyle": "describe in 3-5 words (e.g. soft diffused top-left)",
  "bgTone": "describe background color and texture in 3-5 words (e.g. warm off-white matte)",
  "colorTemperature": "warm / cool / neutral",
  "moodKeywords": ["keyword1", "keyword2", "keyword3"],
  "compositionStyle": "minimal / editorial / lifestyle / dynamic / flat-lay",
  "overallAesthetic": "one sentence describing the visual mood as a photography direction brief"
}
Return ONLY the JSON. No markdown, no explanation.`;

      console.log("AI call: analyze-main-shot started");
      const result = await callLovableAI({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: mainShotUrl } },
              { type: "text", text: moodPrompt },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      console.log("AI call: analyze-main-shot completed");

      if (result.rateLimited) {
        const msg = result.status === 429
          ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
          : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let content = result.data?.choices?.[0]?.message?.content || "";
      content = typeof content === "string" ? content.trim() : "";
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let moodData;
      try {
        moodData = JSON.parse(content);
      } catch {
        console.error("analyze-main-shot JSON parse error:", content);
        return new Response(JSON.stringify({ error: "무드 분석 JSON 파싱 실패" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ moodData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: generate-basic-details ───
    if (action === "generate-basic-details") {
      const { productImageBase64, shotIndex, detectedCategory, backgroundTone, backgroundHex, referenceImageBase64: refImageBase64 } = body;
      if (!productImageBase64 || shotIndex === undefined) {
        return new Response(JSON.stringify({ error: "productImageBase64 and shotIndex are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prodUrl = productImageBase64.startsWith("data:")
        ? productImageBase64
        : `data:image/jpeg;base64,${productImageBase64}`;

      // Dynamically build Color Adaptation section
      const colorAdaptationSection = backgroundTone
        ? `Color Adaptation (PRE-DETERMINED — DO NOT OVERRIDE)
The background tone has been pre-determined: "${backgroundTone}". Use EXACTLY this tone for the background. The background must appear nearly white with bright white studio lighting and only a very subtle hint of color. Do NOT re-analyze or change the background color. Do NOT make the background saturated. The background MUST be: ${backgroundTone}.`
        : `Color Adaptation
Extract the dominant product color (liquid or packaging tone). Use this color ONLY to generate a lighter, pastel-toned background. Do NOT alter the product color itself. Background = softened, desaturated variation of the product color.`;

      // Build background color section with hex code enforcement
      let backgroundColorSection: string;
      if (backgroundHex && backgroundTone) {
        backgroundColorSection = `BACKGROUND COLOR
Use EXACTLY this hex color as the background: ${backgroundHex}
The background tone description: "${backgroundTone}".
The background must be this exact color (${backgroundHex}) with bright white studio lighting.
This exact background color must appear identically in both images.
Do NOT re-analyze or change the background color.
No hue shifts, no brightness changes, no gradients between shots.`;
      } else if (backgroundTone) {
        backgroundColorSection = `BACKGROUND COLOR
The background tone has been pre-determined: "${backgroundTone}".
Use EXACTLY this tone for the background in ALL images.
Do NOT re-analyze or change the background color.
This exact background tone must appear identically in both images.
No hue shifts, no brightness changes, no gradients between shots.`;
      } else {
        backgroundColorSection = `BACKGROUND COLOR
Analyze the uploaded product and extract its single most dominant color.
Derive one pastel-toned background color from that dominant color.
This exact background tone must appear identically in both images.
No hue shifts, no brightness changes, no gradients between shots.`;
      }

      const systemPrompt = `You are a high-end commercial product photography AI. When a user uploads a product image, perform the following steps in order:

STEP 1 — Product Category Detection
Analyze the uploaded image and classify the product into exactly ONE of the following categories:
BEAUTY — Skincare, serum, cosmetics, perfume, body care (glass or plastic bottle/tube/jar)
TECH — Electronics, gadgets, devices, wearables, accessories with mechanical or digital components
FOOD — Food packaging, snack bags, beverage cans/bottles, meal boxes, health food pouches

STEP 2 — Lock the Unified Visual System
Before generating any image, define and lock ONE unified visual system for the entire session.
This system must be applied identically across all 4 images.
No visual variable may shift between shots.

STEP 3 — Generate Individual Images
Generate each shot as a SEPARATE, STANDALONE image.
Do NOT create grids, collages, or composite layouts.
Do NOT combine multiple shots into one image.
Each image is one scene, one shot, one composition.
Format: 4:5 vertical (portrait) per image.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ UNIFIED VISUAL SYSTEM DEFINITION
(Defined once per session — locked across BOTH images)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${backgroundColorSection}

LIGHTING SETUP
One consistent lighting rig is applied across both images:
- Key light: large softbox at 45° upper-left, soft and diffused
- Rim light: subtle backlight creating a clean edge separation
- Fill light: low-intensity diffused fill from the right to reduce harsh shadows
This exact lighting direction, intensity, and quality must not change between shots.

SURFACE & SHADOW
Both images share the same surface treatment:
- Surface: matte finish, same tone as the background with a slight value contrast only
- Shadow: soft natural contact shadow, consistent direction and softness across both images

COLOR GRADE & MOOD
One unified color grade is applied across both images:
- Color temperature: inferred from the product (warm / neutral / cool)
- Contrast: medium-low, premium editorial style
- Saturation: slightly desaturated for a luxury, high-end feel
- Overall mood: clean, minimal, aspirational

PRODUCT IDENTITY LOCK
The uploaded product's shape, proportions, label layout, typography, logo, color, material finish,
and surface detail must remain completely identical across both images.
No variation in product rendering between shots is permitted.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧴 CATEGORY: BEAUTY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source Reference (CRITICAL)
Maintain the exact product identity from the uploaded image.
Do NOT change the bottle shape, proportions, label layout, typography, logo,
liquid transparency, or liquid color.
The product must remain crisp, well-defined, and visually solid across all shots.
All background, lighting, surface, shadow, and color grade values:
→ Follow UNIFIED VISUAL SYSTEM above. Do not redefine per shot.

🖼 BEAUTY — Individual Shot List (2 Images Total)
[BEAUTY — Image 1] Top-Down Flat Lay
COMPOSITION: Minimal bird's-eye view. Product perfectly centered on the unified background surface.
Camera: directly overhead, 90° top-down.
All environment values: UNIFIED VISUAL SYSTEM.
NO PROPS / NO FLOWERS / NO FRUITS / NO OBJECTS / NO HUMAN HANDS.

[BEAUTY — Image 2] Hand & Product Portrait
COMPOSITION: A minimal shot of a Korean woman's hand gently holding the product.
Only the hand is visible — no face, no body, no other elements.
The product label and identity must remain fully visible and unaltered.
All environment values: UNIFIED VISUAL SYSTEM.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 CATEGORY: TECH
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source Reference (CRITICAL)
Maintain the exact product identity from the uploaded image.
Do NOT alter the product's shape, proportions, materials, surface finish, color, logo,
text, buttons, ports, indicators, or interface details.
The product must remain crisp, precise, and physically realistic across all shots.
All background, lighting, surface, shadow, and color grade values:
→ Follow UNIFIED VISUAL SYSTEM above. Do not redefine per shot.

🖼 TECH — Individual Shot List (2 Images Total)
[TECH — Image 1] Hero Front View
COMPOSITION: Clean, centered hero shot. Full product visible, emphasizing overall form and silhouette.
Camera: straight-on, eye-level, centered.
All environment values: UNIFIED VISUAL SYSTEM.
NO HUMAN PRESENCE.

[TECH — Image 2] Angled 3/4 View
COMPOSITION: Three-quarter angle highlighting depth, curvature, and dimensionality of the product.
Camera: 45° horizontal offset, slight elevation.
All environment values: UNIFIED VISUAL SYSTEM.
NO HUMAN PRESENCE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍱 CATEGORY: FOOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source Reference (CRITICAL)
Maintain the exact identity of the uploaded food package.
Do NOT change the package shape, proportions, structure, branding layout,
typography, logo, illustrations, or printed text.

Food Content Inference
Analyze the package design, text, and visual cues to infer the food product inside.
Generate realistic food visuals that naturally match the inferred product type.
The inferred food must be consistent and identical across all shots where it appears.
All background, lighting, surface, shadow, and color grade values:
→ Follow UNIFIED VISUAL SYSTEM above. Do not redefine per shot.

🖼 FOOD — Individual Shot List (2 Images Total)
[FOOD — Image 1] Package + Food Composition
COMPOSITION: The package placed beside the inferred food product.
Clearly communicates what the package contains.
Camera: slight 3/4 angle, natural eye-level.
All environment values: UNIFIED VISUAL SYSTEM.
NO HUMAN PRESENCE.

[FOOD — Image 2] Hero Lifestyle Angle
COMPOSITION: Low or natural eye-level angle combining the package and food.
Strong, appetizing final hero composition. Feels editorial and aspirational.
Camera: low angle, slight upward tilt toward package.
All environment values: UNIFIED VISUAL SYSTEM.
NO HUMAN PRESENCE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ UNIVERSAL TECHNICAL CONSTRAINTS (All Categories)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Output Format: Each image is a standalone 4:5 vertical image. No grids, no collages, no composite layouts.
Rendering Quality: 8K resolution equivalent. Ultra-sharp focus. Physically accurate reflections, shadows, and material response.
Visual Consistency Enforcement: Before rendering each image, re-check that the following are identical to Image 1:
- Background color and tone
- Lighting direction and quality
- Surface material and shadow style
- Color grade and temperature
- Product shape, label, and finish
Brand / Typography Integrity: Follow the reference label or packaging exactly. No font changes, no reinterpretation of logo or label.
Product Identity: The uploaded product must not be reshaped, recolored, or redesigned in any shot.
No Human Presence: No hands, no faces — EXCEPT [BEAUTY — Image 2].`;

      // Build shot instruction with mandatory background + hex enforcement
      let shotInstruction: string;
      const bgHexNote = backgroundHex ? `\nMANDATORY BACKGROUND HEX: Use EXACTLY this hex color as the background: ${backgroundHex}. The background must be this exact color.` : "";
      if (detectedCategory && backgroundTone) {
        shotInstruction = `The product category is ${detectedCategory}.
MANDATORY BACKGROUND: Use exactly "${backgroundTone}" as the background for this image. Do NOT choose a different background color.${bgHexNote}
Now generate ONLY [${detectedCategory} — Image ${shotIndex}]. Generate exactly ONE standalone 4:5 vertical image. Do not generate any other images.`;
      } else {
        shotInstruction = `Now generate ONLY Image ${shotIndex} for the detected category. Generate exactly ONE standalone 4:5 vertical image. Do not generate any other images.${bgHexNote}`;
      }

      // If shotIndex=2 and reference image provided, add reference matching instruction
      if (shotIndex === 2 && refImageBase64) {
        shotInstruction += `\n\nIMPORTANT — REFERENCE IMAGE MATCHING:
The second image attached below is the reference shot (Image 1 already generated).
You MUST match its background color, lighting direction, surface texture, and overall color grade EXACTLY.
The two images must look like they belong to the same photographic series with identical environments.`;
      }

      // Build user content with product image + optional reference image
      const userContent: unknown[] = [
        { type: "image_url", image_url: { url: prodUrl } },
      ];
      if (shotIndex === 2 && refImageBase64) {
        const refUrl = refImageBase64.startsWith("data:")
          ? refImageBase64
          : `data:image/jpeg;base64,${refImageBase64}`;
        userContent.push({ type: "image_url", image_url: { url: refUrl } });
      }
      userContent.push({ type: "text", text: shotInstruction });

      console.log(`AI call: generate-basic-details shotIndex=${shotIndex} started`);
      const result = await callLovableAI({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: userContent,
          },
        ],
        modalities: ["image", "text"],
        temperature: 1,
      });

      console.log(`AI call: generate-basic-details shotIndex=${shotIndex} completed`);

      if (result.rateLimited) {
        const msg = result.status === 429
          ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
          : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract image
      let imageDataUri: string | null = null;
      const choices = result.data?.choices;
      const images = choices?.[0]?.message?.images;
      if (Array.isArray(images) && images.length > 0) {
        imageDataUri = images[0]?.image_url?.url || null;
      }
      if (!imageDataUri) {
        const msgContent = choices?.[0]?.message?.content;
        if (Array.isArray(msgContent)) {
          for (const part of msgContent) {
            if (part.type === "image_url" && part.image_url?.url) { imageDataUri = part.image_url.url; break; }
            if (part.type === "image" && part.image?.url) { imageDataUri = part.image.url; break; }
            if (part.inline_data) { imageDataUri = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`; break; }
          }
        } else if (typeof msgContent === "string" && msgContent.startsWith("data:")) {
          imageDataUri = msgContent;
        }
      }

      if (!imageDataUri) {
        console.error("No image in basic-detail response for shot", shotIndex);
        return new Response(JSON.stringify({ error: `상세컷 ${shotIndex} 생성에 실패했습니다.` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ imageDataUri, shotIndex }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: generate-ai-recommended ───
    if (action === "generate-ai-recommended") {
      const { productImageBase64, shotIndex, mainShotMood, aspectRatio, shotLabel } = body;
      if (!productImageBase64 || shotIndex === undefined) {
        return new Response(JSON.stringify({ error: "productImageBase64 and shotIndex are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prodUrl = productImageBase64.startsWith("data:")
        ? productImageBase64
        : `data:image/jpeg;base64,${productImageBase64}`;

      // Build mood consistency section
      const moodSection = mainShotMood ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 VISUAL CONSISTENCY REFERENCE (CRITICAL — FOLLOW EXACTLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The main concept shot for this product has already been generated.
You MUST maintain full visual consistency with that shot across all recommended images.
Lighting Style     : ${mainShotMood.lightingStyle}
Background Tone    : ${mainShotMood.bgTone}
Color Temperature  : ${mainShotMood.colorTemperature}
Composition Style  : ${mainShotMood.compositionStyle}
Mood Keywords      : ${mainShotMood.moodKeywords?.join(", ")}
Overall Aesthetic  : ${mainShotMood.overallAesthetic}
MANDATORY RULES:
- Replicate the background tone as precisely as possible
- Maintain the same lighting direction and quality
- Keep the same color temperature (${mainShotMood.colorTemperature})
- Every output must feel like it belongs to the same visual series as the main concept shot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : "";

      const aspectMap: Record<string, string> = {
        "1:1": "square 1:1 aspect ratio",
        "9:16": "vertical portrait 9:16 aspect ratio",
        "16:9": "horizontal landscape 16:9 aspect ratio",
        "3:4": "vertical 3:4 aspect ratio",
        "4:3": "horizontal 4:3 aspect ratio",
      };
      const ratioInstruction = aspectRatio ? aspectMap[aspectRatio] || "" : "";

      const systemPrompt = `${moodSection}You are a high-end commercial product photography AI specializing in detail shots.
Generate a single standalone product detail shot based on the following instruction.
Preserve the product's label, typography, proportions, silhouette, and structural design exactly.
Do NOT generate grids, collages, or composite layouts. One scene, one shot, one composition.
${ratioInstruction ? `Output format: ${ratioInstruction}.` : "Output format: 4:5 vertical (portrait)."}`;

      const shotInstruction = shotLabel
        ? `Generate a detail shot: "${shotLabel}". Make it a premium, editorial-quality product photograph.`
        : `Generate detail shot #${shotIndex}. Make it a premium, editorial-quality product photograph.`;

      console.log(`AI call: generate-ai-recommended shotIndex=${shotIndex} started`);
      const result = await callLovableAI({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: prodUrl } },
              { type: "text", text: shotInstruction },
            ],
          },
        ],
        modalities: ["image", "text"],
        temperature: 1,
      });

      console.log(`AI call: generate-ai-recommended shotIndex=${shotIndex} completed`);

      if (result.rateLimited) {
        const msg = result.status === 429
          ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
          : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract image (same pattern as generate-basic-details)
      let imageDataUri: string | null = null;
      const choices = result.data?.choices;
      const images = choices?.[0]?.message?.images;
      if (Array.isArray(images) && images.length > 0) {
        imageDataUri = images[0]?.image_url?.url || null;
      }
      if (!imageDataUri) {
        const msgContent = choices?.[0]?.message?.content;
        if (Array.isArray(msgContent)) {
          for (const part of msgContent) {
            if (part.type === "image_url" && part.image_url?.url) { imageDataUri = part.image_url.url; break; }
            if (part.type === "image" && part.image?.url) { imageDataUri = part.image.url; break; }
            if (part.inline_data) { imageDataUri = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`; break; }
          }
        } else if (typeof msgContent === "string" && msgContent.startsWith("data:")) {
          imageDataUri = msgContent;
        }
      }

      if (!imageDataUri) {
        console.error("No image in ai-recommended response for shot", shotIndex);
        return new Response(JSON.stringify({ error: `AI 추천 상세컷 ${shotIndex} 생성에 실패했습니다.` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ imageDataUri, shotIndex }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── ACTION: outpaint ───
    if (action === "outpaint") {
      const { imageBase64, aspectRatio } = body;
      if (!imageBase64 || !aspectRatio) {
        return new Response(JSON.stringify({ error: "imageBase64 and aspectRatio are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (aspectRatio === "1:1") {
        return new Response(JSON.stringify({ imageDataUri: imageBase64 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aspectRatioDescriptions: Record<string, string> = {
        "9:16": "vertical 9:16 portrait format (significantly taller than wide)",
        "16:9": "horizontal 16:9 landscape format (significantly wider than tall)",
        "3:4":  "vertical 3:4 portrait format (slightly taller than wide)",
        "4:3":  "horizontal 4:3 landscape format (slightly wider than tall)",
      };
      const ratioDesc = aspectRatioDescriptions[aspectRatio] || aspectRatio;

      const dataUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

      const outpaintPrompt = `You are an expert photo compositor. The uploaded image is a product photograph shot in a studio.

YOUR TASK: Extend/expand this image canvas to fit a ${ratioDesc}, by naturally continuing the existing background beyond the current image edges.

STRICT RULES:
- Keep the product EXACTLY as-is: same size, same position, same lighting, same labels — DO NOT alter the product in any way
- Extend ONLY the background/studio environment to fill the new canvas area
- The extended background must seamlessly blend with the existing background (same color, gradient, vignette, lighting direction)
- Do NOT add any new objects, props, people, or elements in the extended area
- Do NOT crop or resize the product — it must remain the same size
- The product stays centered horizontally in the final image
- Maintain identical background color temperature, texture, and lighting throughout the extended area
- The final result must look like the photo was originally composed at ${ratioDesc}

OUTPUT: A single cohesive image at ${ratioDesc} with the product centered and the background naturally extended.`;

      console.log(`AI call: outpaint started (${aspectRatio})`);
      const result = await callLovableAI({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              { type: "text", text: outpaintPrompt },
            ],
          },
        ],
        modalities: ["image", "text"],
        temperature: 1,
      });
      console.log(`AI call: outpaint completed (${aspectRatio})`);

      if (result.rateLimited) {
        const msg = result.status === 429
          ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
          : "크레딧이 부족합니다. Lovable 설정에서 크레딧을 추가해주세요.";
        return new Response(JSON.stringify({ error: msg }), {
          status: result.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract image from multimodal response
      let imageDataUri: string | null = null;
      const choices = result.data?.choices;
      const images = choices?.[0]?.message?.images;
      if (Array.isArray(images) && images.length > 0) {
        imageDataUri = images[0]?.image_url?.url || null;
      }
      if (!imageDataUri) {
        const msgContent = choices?.[0]?.message?.content;
        if (Array.isArray(msgContent)) {
          for (const part of msgContent) {
            if (part.type === "image_url" && part.image_url?.url) { imageDataUri = part.image_url.url; break; }
            if (part.type === "image" && part.image?.url) { imageDataUri = part.image.url; break; }
            if (part.inline_data) { imageDataUri = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`; break; }
          }
        } else if (typeof msgContent === "string" && msgContent.startsWith("data:")) {
          imageDataUri = msgContent;
        }
      }

      if (!imageDataUri) {
        console.error("No image in outpaint response");
        return new Response(JSON.stringify({ error: "아웃페인팅에 실패했습니다. 다시 시도해주세요." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ imageDataUri }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-product error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
