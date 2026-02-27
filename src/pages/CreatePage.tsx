import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { DetailRecommendation } from "@/components/create/AIRecommendation";
import dynamicAngleRefImage from "@/assets/dynamic-angle-reference.jpg";

import { StepIndicator } from "@/components/create/StepIndicator";
import { StepUpload } from "@/components/create/StepUpload";
import { StepStyle } from "@/components/create/StepStyle";
import { StepOptions } from "@/components/create/StepOptions";
import { ResultView } from "@/components/create/ResultView";

const STEPS = [
  { label: "제품 이미지", description: "업로드" },
  { label: "컨셉 스타일", description: "선택" },
  { label: "생성 옵션", description: "선택" },
];

interface DetailOptions {
  basicDetails: boolean;
  aiRecommended: boolean;
  selectedAIDetails: string[];
  mainAspectRatio: string;
  basicAspectRatio: string;
  aiAspectRatio: string;
}

export interface TextureAnalysis {
  container_color: string;
  container_material: string;
  container_type: string;
  product_category: string;
  selected_texture: string;
  texture_reason_ko: string;
}

const TEXTURE_LABELS: Record<string, string> = {
  foam_lather: "폼 래더",
  cream_swirl: "크림 스월",
  gel_oil_drip: "젤 드립",
  crystal_grain: "크리스탈 그레인",
  silk_drape: "실크 드레이프",
  water_drops: "워터 드롭",
  mochi_stretch: "모찌 스트레치",
};

const CATEGORY_LABELS: Record<string, string> = {
  shampoo: "샴푸",
  "body wash": "바디워시",
  cleanser: "클렌저",
  serum: "세럼",
  ampoule: "앰플",
  moisturizer: "모이스처라이저",
  cream: "크림",
  mask: "마스크",
  scrub: "스크럽",
  toner: "토너",
  perfume: "퍼퓸",
  "body oil": "바디오일",
  other: "기타",
};

/** Resize image to max 1024px using Canvas API to reduce payload size */
const resizeImage = (dataUrl: string, maxSize = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(dataUrl);
        return;
      }
      const scale = maxSize / Math.max(width, height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

const CreatePage = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [detailOptions, setDetailOptions] = useState<DetailOptions>({
    basicDetails: false,
    aiRecommended: false,
    selectedAIDetails: [],
    mainAspectRatio: "1:1",
    basicAspectRatio: "1:1",
    aiAspectRatio: "1:1",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textureAnalysis, setTextureAnalysis] = useState<TextureAnalysis | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedDetailImages, setGeneratedDetailImages] = useState<Record<string, string>>({});
  const [detailGeneratingIndex, setDetailGeneratingIndex] = useState(-1);
  const [referenceAnalysis, setReferenceAnalysis] = useState<Record<string, string> | null>(null);
  const [detailRecommendation, setDetailRecommendation] = useState<DetailRecommendation | null>(null);

  const analyzeProductForTexture = async (): Promise<boolean> => {
    if (!productImage) return false;

    setIsAnalyzing(true);
    try {
      // Convert image to base64 + resize
      const response = await fetch(productImage);
      const blob = await response.blob();
      const rawBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64 = await resizeImage(rawBase64);

      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { action: "analyze", imageBase64: base64 },
        headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setTextureAnalysis(data.analysis);
      setGenerationPrompt(data.generationPrompt);

      const categoryKo = CATEGORY_LABELS[data.analysis.product_category] || data.analysis.product_category;
      const textureKo = TEXTURE_LABELS[data.analysis.selected_texture] || data.analysis.selected_texture;

      toast({
        title: `✓ ${categoryKo}(으)로 인식 — ${textureKo} 텍스처 자동 선택됨`,
        description: data.analysis.texture_reason_ko,
      });

      return true;
    } catch (e) {
      console.error("Texture analysis error:", e);
      toast({
        title: "분석 실패",
        description: "제품 분석에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeReference = async (): Promise<boolean> => {
    if (!referenceImage) return false;
    setIsAnalyzing(true);
    try {
      const response = await fetch(referenceImage);
      const blob = await response.blob();
      const rawBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64 = await resizeImage(rawBase64);

      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { action: "analyze-reference", imageBase64: base64 },
        headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setReferenceAnalysis(data.referenceAnalysis);
      toast({
        title: "✓ 레퍼런스 배경 분석 완료",
        description: `분위기: ${data.referenceAnalysis.mood}`,
      });
      return true;
    } catch (e) {
      console.error("Reference analysis error:", e);
      toast({
        title: "분석 실패",
        description: "레퍼런스 분석에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStyleNext = async () => {
    if (selectedStyle === "texture-concept") {
      const success = await analyzeProductForTexture();
      if (!success) return;
    } else if (selectedStyle === "custom") {
      const success = await analyzeReference();
      if (!success) return;
    }
    setCurrentStep(3);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Prepare product base64 once if needed for details
      let productBase64: string | null = null;
      if (detailOptions.basicDetails && productImage) {
        const resp = await fetch(productImage);
        const blob = await resp.blob();
        const rawBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        productBase64 = await resizeImage(rawBase64);
      }

      // Build main shot promise
      const mainShotPromise = (async (): Promise<string | null> => {
        if (selectedStyle === "darklight-studio" && productImage) {
          const resp = await fetch(productImage);
          const blob = await resp.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          const darklightPrompt = `Analyze this product's material (glass, metal, plastic, matte, etc.) and generate a premium studio product photograph. Place the product in a minimalist studio with a refined black-to-white gradient background on a clean reflective or matte surface. Use a Sony A7C II with 50mm macro lens, eye-level perspective. Apply material-aware lighting: controlled top key light, subtle directional side lighting, and soft rim light for silhouette separation. Preserve all brand logos, text, labels, proportions exactly. No new text, no props, no modifications to product structure. Photorealistic, ultra-clean, refined cinematic editorial, modern luxury campaign aesthetic.`;

          const { data, error } = await supabase.functions.invoke("analyze-product", {
            body: { action: "generate", prompt: darklightPrompt, productImageBase64: base64, aspectRatio: detailOptions.mainAspectRatio },
            headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
          });

          if (error) throw new Error(error.message);
          if (data?.error) throw new Error(data.error);
          if (!data?.imageDataUri) throw new Error("이미지 데이터를 받지 못했습니다.");
          return data.imageDataUri;
        } else if (selectedStyle === "dynamic-angle" && productImage) {
          const resp = await fetch(productImage);
          const blob = await resp.blob();
          const rawBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const base64 = await resizeImage(rawBase64);

          // Load the static ARKIVE reference image from assets
          const refResp = await fetch(dynamicAngleRefImage);
          const refBlob = await refResp.blob();
          const refBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(refBlob);
          });

          const dynamicAnglePrompt = `You are generating a premium beauty product photography image. Follow these instructions exactly.

PRODUCT EXTRACTION:
Extract ONLY the product from the uploaded product image. Remove all background, surface, and surrounding elements from the uploaded product image. Preserve every detail of the product's shape, label, texture, and color exactly as shown.

COMPOSITION AND ASPECT RATIO:
Slight low-angle camera shot — the camera is positioned just below product eye-level, angled slightly upward. The podium's top surface is barely visible, giving a grounded premium feel. Product is centered horizontally with generous negative space above. Single product placement, front-facing. Aspect ratio: 4:5 vertical.

CAMERA AND LIGHTING DETAILS:
Strong directional side light entering from the upper-right at approximately 45 degrees. This creates a dramatic, high-contrast shadow that extends long and sharp to the LEFT side of the product on the podium surface. The shadow is defined with soft feathered edges — not completely hard, but clearly directional. The background has a subtle radial brightening at the upper-center, naturally fading outward to light gray at the corners — this is a gentle ambient glow, not a spotlight shape. No circular orb or hard-edged light on background.

ACTION:
Product is stationary, standing upright on the podium surface.

LOCATION AND ENVIRONMENT:
Clean minimal indoor studio. Background: smooth seamless light gray (warm-neutral gray, not blue), slightly brighter at the upper-center and softly darker at the corners. Podium: a flat, matte white-to-light-gray surface clearly separated from the background wall. The podium surface is noticeably lighter/brighter than the background wall behind it. A clear horizontal edge defines the boundary between podium and background.

STYLE:
Premium commercial beauty product photography. Dramatic yet clean. High-end, editorial quality. Neutral warm-gray palette — no blue tones, no yellow warmth. Photorealistic with crisp product details and rich shadow depth.

TEXT:
Preserve all original text and labels on the product exactly as-is. No new text.

NEGATIVE PROMPTS:
no blue background, no warm orange tones, no props, no hands, no circular glowing orb on background, no multiple products, no cluttered composition, no glossy reflective podium surface, no flat even lighting, no soft shadowless look.`;

          const { data, error } = await supabase.functions.invoke("analyze-product", {
            body: {
              action: "generate",
              prompt: dynamicAnglePrompt,
              productImageBase64: base64,
              referenceImageBase64: refBase64,
              aspectRatio: detailOptions.mainAspectRatio,
            },
            headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
          });

          if (error) throw new Error(error.message);
          if (data?.error) throw new Error(data.error);
          if (!data?.imageDataUri) throw new Error("이미지 데이터를 받지 못했습니다.");
          return data.imageDataUri;
        } else if (selectedStyle === "custom" && productImage && referenceImage && referenceAnalysis) {
          const [prodResp, refResp] = await Promise.all([fetch(productImage), fetch(referenceImage)]);
          const [prodBlob, refBlob] = await Promise.all([prodResp.blob(), refResp.blob()]);
          const [prodBase64, refBase64] = await Promise.all([
            new Promise<string>((resolve) => { const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.readAsDataURL(prodBlob); }),
            new Promise<string>((resolve) => { const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.readAsDataURL(refBlob); }),
          ]);

          const { data, error } = await supabase.functions.invoke("analyze-product", {
            body: {
              action: "generate",
              prompt: "Product composite photography with reference scene.",
              productImageBase64: prodBase64,
              referenceImageBase64: refBase64,
              referenceAnalysis,
              aspectRatio: detailOptions.mainAspectRatio,
            },
            headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
          });

          if (error) throw new Error(error.message);
          if (data?.error) throw new Error(data.error);
          if (!data?.imageDataUri) throw new Error("이미지 데이터를 받지 못했습니다.");
          return data.imageDataUri;
        } else if (selectedStyle === "texture-concept" && generationPrompt) {
          const { data, error } = await supabase.functions.invoke("analyze-product", {
            body: { action: "generate", prompt: generationPrompt, aspectRatio: detailOptions.mainAspectRatio },
            headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
          });

          if (error) throw new Error(error.message);
          if (data?.error) throw new Error(data.error);
          if (!data?.imageDataUri) throw new Error("이미지 데이터를 받지 못했습니다.");
          return data.imageDataUri;
        } else {
          await new Promise((r) => setTimeout(r, 3000));
          return null;
        }
      })();

      // Pre-detect color for consistent backgrounds across detail shots (parallel with main shot)
      let detectedCategory: string | null = null;
      let backgroundTone: string | null = null;
      let backgroundHex: string | null = null;
      const detectColorPromise = (detailOptions.basicDetails && productBase64)
        ? (async () => {
            try {
              const { data: colorData, error: colorError } = await supabase.functions.invoke("analyze-product", {
                body: { action: "detect-color", productImageBase64: productBase64 },
                headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
              });
              if (!colorError && colorData?.detectedCategory && colorData?.backgroundTone) {
                detectedCategory = colorData.detectedCategory;
                backgroundTone = colorData.backgroundTone;
                backgroundHex = colorData.backgroundHex || null;
                console.log("Color detected:", { detectedCategory, backgroundTone, backgroundHex });
              }
            } catch (e) {
              console.error("Color detection failed, proceeding without:", e);
            }
          })()
        : Promise.resolve();

      // Run main shot + detect-color in parallel
      const [mainImage] = await Promise.all([mainShotPromise, detectColorPromise]);

      // Sequential detail shot generation: Shot 1 first, then Shot 2 with reference
      const detailMap: Record<string, string> = {};
      if (detailOptions.basicDetails && productBase64) {
        // Shot 1: generate independently
        try {
          const { data, error } = await supabase.functions.invoke("analyze-product", {
            body: {
              action: "generate-basic-details",
              productImageBase64: productBase64,
              shotIndex: 1,
              ...(detectedCategory && backgroundTone ? { detectedCategory, backgroundTone } : {}),
              ...(backgroundHex ? { backgroundHex } : {}),
            },
            headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
          });
          if (!error && data?.imageDataUri) {
            detailMap["basic-1"] = data.imageDataUri;
          } else {
            console.error("Detail shot 1 failed:", error || data?.error);
          }
        } catch (e) {
          console.error("Detail shot 1 error:", e);
        }

        // Shot 2: use Shot 1 result as reference image
        try {
          const shot1Base64 = detailMap["basic-1"] || null;
          const { data, error } = await supabase.functions.invoke("analyze-product", {
            body: {
              action: "generate-basic-details",
              productImageBase64: productBase64,
              shotIndex: 2,
              ...(detectedCategory && backgroundTone ? { detectedCategory, backgroundTone } : {}),
              ...(backgroundHex ? { backgroundHex } : {}),
              ...(shot1Base64 ? { referenceImageBase64: shot1Base64 } : {}),
            },
            headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
          });
          if (!error && data?.imageDataUri) {
            detailMap["basic-2"] = data.imageDataUri;
          } else {
            console.error("Detail shot 2 failed:", error || data?.error);
          }
        } catch (e) {
          console.error("Detail shot 2 error:", e);
        }
      }

      // Update main image immediately
      setGeneratedImage(mainImage);

      // ── Mood analysis + AI recommended detail shots ──
      if (detailOptions.aiRecommended && mainImage && detailOptions.selectedAIDetails.length > 0) {
        // Step 1: Analyze main shot mood
        let mainShotMood = null;
        try {
          const mainBase64 = mainImage.startsWith("data:")
            ? mainImage.split(",")[1]
            : mainImage;
          const { data: moodResult, error: moodError } = await supabase.functions.invoke("analyze-product", {
            body: { action: "analyze-main-shot", mainShotImageBase64: mainBase64 },
            headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
          });
          if (!moodError && moodResult?.moodData) {
            mainShotMood = moodResult.moodData;
            console.log("Main shot mood analyzed:", mainShotMood);
          }
        } catch (e) {
          console.warn("Main shot mood analysis failed, proceeding without mood:", e);
        }

        // Step 2: Generate AI recommended detail shots in parallel
        // Prepare product base64 for AI recommended shots
        let aiProductBase64 = productBase64;
        if (!aiProductBase64 && productImage) {
          const resp = await fetch(productImage);
          const blob = await resp.blob();
          const rawB64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          aiProductBase64 = await resizeImage(rawB64);
        }

        if (aiProductBase64) {
          const aiDetailPromises = detailOptions.selectedAIDetails.map((detailId, i) => {
            const shotLabel = detailRecommendation?.details.find(d => d.id === detailId)?.label || detailId;
            return (async () => {
              try {
                const { data, error } = await supabase.functions.invoke("analyze-product", {
                  body: {
                    action: "generate-ai-recommended",
                    productImageBase64: aiProductBase64,
                    shotIndex: i + 1,
                    mainShotMood,
                    aspectRatio: detailOptions.aiAspectRatio,
                    shotLabel,
                  },
                  headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
                });
                if (!error && data?.imageDataUri) {
                  return { key: detailId, uri: data.imageDataUri };
                }
                console.error(`AI detail ${detailId} failed:`, error || data?.error);
                return { key: detailId, uri: null };
              } catch (err) {
                console.error(`AI detail ${detailId} error:`, err);
                return { key: detailId, uri: null };
              }
            })();
          });

          const aiResults = await Promise.all(aiDetailPromises);
          for (const r of aiResults) {
            if (r.uri) detailMap[r.key] = r.uri;
          }
        }
      }

      setGeneratedDetailImages(detailMap);
      setShowResult(true);
    } catch (e) {
      console.error("Image generation error:", e);
      toast({
        title: "생성 실패",
        description: "이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setProductImage(null);
    setSelectedStyle(null);
    setReferenceImage(null);
    setDetailOptions({ basicDetails: false, aiRecommended: false, selectedAIDetails: [], mainAspectRatio: "1:1", basicAspectRatio: "1:1", aiAspectRatio: "1:1" });
    setShowResult(false);
    setIsGenerating(false);
    setTextureAnalysis(null);
    setGenerationPrompt(null);
    setGeneratedImage(null);
    setGeneratedDetailImages({});
    setDetailGeneratingIndex(-1);
    setReferenceAnalysis(null);
    setDetailRecommendation(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 px-6 py-3 border-b border-border/50 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-muted-foreground">컨셉샷 생성</h1>
        {!showResult && <StepIndicator currentStep={currentStep} steps={STEPS} />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex">
        {/* Analyzing loading screen */}
        {isAnalyzing || isGenerating ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            {/* Animated logo/spinner */}
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2 max-w-xs">
              <p className="text-lg font-semibold">
                {isGenerating
                  ? detailOptions.basicDetails
                    ? "메인 컨셉샷 + 상세컷 2장을 생성 중입니다..."
                    : "메인 컨셉샷을 생성 중입니다..."
                  : currentStep === 1
                  ? "AI가 제품을 분석 중입니다..."
                  : selectedStyle === "custom"
                  ? "AI가 레퍼런스를 분석 중입니다..."
                  : "AI가 제품을 분석 중입니다..."}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isGenerating
                  ? "고품질 이미지를 생성하고 있어요. 잠시만 기다려주세요"
                  : currentStep === 1
                  ? "제품에 맞는 최적의 상세컷을 추천하고 있어요"
                  : selectedStyle === "custom"
                  ? "레퍼런스 이미지의 배경 컨셉을 추출하고 있어요"
                  : "제품 특성에 맞는 텍스처를 자동으로 선택하고 있어요"}
              </p>
            </div>
            <div className="w-64 space-y-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full animate-pulse w-2/3" />
              </div>
              <p className="text-center text-xs text-muted-foreground/60">
                {isGenerating ? "약 30초 소요됩니다" : "잠시만 기다려주세요"}
              </p>
            </div>
          </div>
        ) : showResult ? (
          <ResultView
            isGenerating={isGenerating}
            onRestart={handleRestart}
            detailOptions={detailOptions}
            generatedImage={generatedImage}
            generatedDetailImages={generatedDetailImages}
            detailGeneratingIndex={detailGeneratingIndex}
          />
        ) : currentStep === 1 ? (
          <StepUpload
            productImage={productImage}
            onImageChange={setProductImage}
            onNext={async () => {
              if (productImage) {
                setIsAnalyzing(true);
                try {
                  const resp = await fetch(productImage);
                  const blob = await resp.blob();
                  const rawBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  });
                  const base64 = await resizeImage(rawBase64);
                  const { data, error } = await supabase.functions.invoke("analyze-product", {
                    body: { action: "analyze-details", imageBase64: base64 },
                    headers: { "x-app-secret": import.meta.env.VITE_APP_SECRET },
                  });
                  if (!error && data?.detailRecommendation) {
                    setDetailRecommendation(data.detailRecommendation);
                  }
                } catch (e) {
                  console.error("Detail analysis error:", e);
                  if (e instanceof DOMException && e.name === "AbortError") {
                    toast({ title: "분석 시간 초과", description: "상세컷 추천 없이 진행합니다.", variant: "destructive" });
                  }
                } finally {
                  setIsAnalyzing(false);
                }
              }
              setCurrentStep(2);
            }}
          />
        ) : currentStep === 2 ? (
          <StepStyle
            selectedStyle={selectedStyle}
            referenceImage={referenceImage}
            onStyleChange={setSelectedStyle}
            onReferenceChange={setReferenceImage}
            onNext={handleStyleNext}
            onBack={() => setCurrentStep(1)}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <StepOptions
            detailOptions={detailOptions}
            onDetailOptionsChange={setDetailOptions}
            onGenerate={handleGenerate}
            onBack={() => setCurrentStep(2)}
            detailRecommendation={detailRecommendation}
          />
        )}
      </div>
    </div>
  );
};

export default CreatePage;
