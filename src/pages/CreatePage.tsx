import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { supabase } from "@/integrations/supabase/client";

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
  foam_lather: "폼 래더", cream_swirl: "크림 스월", gel_oil_drip: "젤 드립",
  crystal_grain: "크리스탈 그레인", silk_drape: "실크 드레이프", water_drops: "워터 드롭", mochi_stretch: "모찌 스트레치",
};

const CATEGORY_LABELS: Record<string, string> = {
  shampoo: "샴푸", "body wash": "바디워시", cleanser: "클렌저", serum: "세럼", ampoule: "앰플",
  moisturizer: "모이스처라이저", cream: "크림", mask: "마스크", scrub: "스크럽", toner: "토너",
  perfume: "퍼퓸", "body oil": "바디오일", other: "기타",
};

const CreatePage = () => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [detailOptions, setDetailOptions] = useState<DetailOptions>({ basicDetails: false, aiRecommended: false, selectedAIDetails: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textureAnalysis, setTextureAnalysis] = useState<TextureAnalysis | null>(null);
  const [generationPrompt, setGenerationPrompt] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const analyzeProductForTexture = async (): Promise<boolean> => {
    if (!productImage) return false;
    setIsAnalyzing(true);
    try {
      const response = await fetch(productImage);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { action: "analyze", imageBase64: base64 },
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
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      return true;
    } catch (e) {
      console.error("Texture analysis error:", e);
      toast({ title: "분석 실패", description: "제품 분석에 실패했습니다. 다시 시도해주세요.", status: "error", duration: 5000, isClosable: true });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStyleNext = async () => {
    if (selectedStyle === "texture-concept") {
      const success = await analyzeProductForTexture();
      if (!success) return;
    }
    setCurrentStep(3);
  };

  const handleGenerate = async () => {
    setShowResult(true);
    setIsGenerating(true);
    try {
      if (selectedStyle === "texture-concept" && generationPrompt) {
        const { data, error } = await supabase.functions.invoke("analyze-product", {
          body: { action: "generate", prompt: generationPrompt },
        });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);
        if (!data?.imageDataUri) throw new Error("이미지 데이터를 받지 못했습니다.");
        setGeneratedImage(data.imageDataUri);
      } else {
        await new Promise((r) => setTimeout(r, 3000));
      }
    } catch (e) {
      console.error("Image generation error:", e);
      toast({ title: "생성 실패", description: "이미지 생성 중 오류가 발생했습니다.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setProductImage(null);
    setSelectedStyle(null);
    setReferenceImage(null);
    setDetailOptions({ basicDetails: false, aiRecommended: false, selectedAIDetails: [] });
    setShowResult(false);
    setIsGenerating(false);
    setTextureAnalysis(null);
    setGenerationPrompt(null);
    setGeneratedImage(null);
  };

  return (
    <Flex direction="column" h="100vh">
      {/* Header */}
      <Flex shrink={0} px={6} py={3} borderBottom="1px solid" borderColor="rgba(37,37,37,0.5)" align="center" justify="space-between">
        <Text fontSize="sm" fontWeight="semibold" color="brand.muted">컨셉샷 생성</Text>
        {!showResult && <StepIndicator currentStep={currentStep} steps={STEPS} />}
      </Flex>

      {/* Content */}
      <Flex flex={1} overflowY="auto" p={6}>
        {isAnalyzing ? (
          <Flex direction="column" align="center" justify="center" flex={1} gap={6}>
            <Box position="relative" h="64px" w="64px">
              <Box position="absolute" inset={0} rounded="full" border="4px solid" borderColor="brand.surface" />
              <Box position="absolute" inset={0} rounded="full" border="4px solid" borderColor="blue.500" borderTopColor="transparent"
                animation="spin 1s linear infinite"
                sx={{ "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }}
              />
            </Box>
            <VStack spacing={1} textAlign="center">
              <Text fontSize="lg" fontWeight="semibold" color="brand.accent">Gemini가 제품을 분석 중입니다...</Text>
              <Text fontSize="sm" color="brand.muted">제품 특성에 맞는 텍스처를 자동으로 선택하고 있어요</Text>
            </VStack>
            <Box w="256px" h="8px" bg="brand.surface" rounded="full" overflow="hidden">
              <Box h="full" bg="blue.500" rounded="full" w="66%"
                animation="pulse 2s ease-in-out infinite"
                sx={{ "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } } }}
              />
            </Box>
          </Flex>
        ) : showResult ? (
          <ResultView isGenerating={isGenerating} onRestart={handleRestart} detailOptions={detailOptions} generatedImage={generatedImage} />
        ) : currentStep === 1 ? (
          <StepUpload productImage={productImage} onImageChange={setProductImage} onNext={() => setCurrentStep(2)} />
        ) : currentStep === 2 ? (
          <StepStyle selectedStyle={selectedStyle} referenceImage={referenceImage} onStyleChange={setSelectedStyle} onReferenceChange={setReferenceImage} onNext={handleStyleNext} onBack={() => setCurrentStep(1)} isAnalyzing={isAnalyzing} />
        ) : (
          <StepOptions detailOptions={detailOptions} onDetailOptionsChange={setDetailOptions} onGenerate={handleGenerate} onBack={() => setCurrentStep(2)} />
        )}
      </Flex>
    </Flex>
  );
};

export default CreatePage;
