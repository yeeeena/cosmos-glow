import { useRef } from "react";
import { Box, Button, Flex, Grid, Image, Text, VStack } from "@chakra-ui/react";
import { Upload, Check } from "lucide-react";

import styleMinimalStudio from "@/assets/style-minimal-studio.webp";
import styleDynamicAngle from "@/assets/style-dynamic-angle.jpg";
import styleNatureLifestyle from "@/assets/style-nature-lifestyle.jpg";
import styleTechFuturistic from "@/assets/style-tech-futuristic.webp";
import styleTextureConcept from "@/assets/style-texture-concept.png";

const stylePresets = [
  { id: "minimal-studio", label: "미니멀 스튜디오", description: "깔끔한 배경, 소프트 라이팅", thumbnail: styleMinimalStudio },
  { id: "dynamic-angle", label: "다이나믹 앵글", description: "역동적 구도, 강렬한 조명 대비", thumbnail: styleDynamicAngle },
  { id: "nature-lifestyle", label: "네이처/라이프스타일", description: "자연광, 생활 맥락 속 제품", thumbnail: styleNatureLifestyle },
  { id: "tech-futuristic", label: "테크/퓨처리스틱", description: "네온, 그리드, SF 감성", thumbnail: styleTechFuturistic },
  { id: "texture-concept", label: "텍스처 컨셉샷", description: "성분 텍스처와 제품이 어우러지는 하이엔드 스튜디오샷", thumbnail: styleTextureConcept },
];

interface StepStyleProps {
  selectedStyle: string | null;
  referenceImage: string | null;
  onStyleChange: (style: string | null) => void;
  onReferenceChange: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  isAnalyzing?: boolean;
}

export function StepStyle({
  selectedStyle, referenceImage, onStyleChange, onReferenceChange, onNext, onBack, isAnalyzing = false,
}: StepStyleProps) {
  const refInputRef = useRef<HTMLInputElement>(null);

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onReferenceChange(url);
      onStyleChange("custom");
    }
  };

  const selectPreset = (id: string) => {
    onStyleChange(id);
    onReferenceChange(null);
  };

  return (
    <Flex direction="column" flex={1} gap={8}>
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color="brand.accent">컨셉 스타일 선택</Text>
        <Text fontSize="sm" color="brand.muted">원하는 촬영 스타일을 선택하거나 레퍼런스 이미지를 업로드하세요</Text>
      </VStack>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4} maxW="3xl" mx="auto" w="full">
        {stylePresets.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <Box
              key={style.id}
              as="button"
              onClick={() => selectPreset(style.id)}
              position="relative"
              display="flex"
              flexDirection="column"
              rounded="xl"
              border="2px solid"
              borderColor={isSelected ? "blue.500" : "brand.surface"}
              overflow="hidden"
              transition="all 0.2s"
              _hover={{ borderColor: isSelected ? "blue.500" : "brand.muted" }}
              bg={isSelected ? "rgba(59,130,246,0.05)" : "brand.surface"}
              boxShadow={isSelected ? "0 0 16px rgba(59,130,246,0.15)" : "none"}
            >
              {isSelected && (
                <Flex position="absolute" top={2} right={2} zIndex={10} h="20px" w="20px" rounded="full" bg="blue.500" align="center" justify="center">
                  <Check size={12} color="white" />
                </Flex>
              )}
              <Box sx={{ aspectRatio: "4/3" }} w="full" overflow="hidden">
                <Image src={style.thumbnail} alt={style.label} h="full" w="full" objectFit="cover" />
              </Box>
              <Box p={3} textAlign="left">
                <Text fontSize="sm" fontWeight="semibold" color="brand.accent">{style.label}</Text>
                <Text fontSize="xs" color="brand.muted" mt={0.5}>{style.description}</Text>
              </Box>
            </Box>
          );
        })}

        {/* Custom reference upload */}
        <input ref={refInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleRefUpload} />
        <Flex
          as="button"
          onClick={() => refInputRef.current?.click()}
          gridColumn={{ base: "span 2", lg: "span 4" }}
          align="center"
          gap={4}
          p={4}
          rounded="xl"
          border="2px"
          borderStyle={selectedStyle === "custom" ? "solid" : "dashed"}
          borderColor={selectedStyle === "custom" ? "blue.500" : "brand.surface"}
          bg={selectedStyle === "custom" ? "rgba(59,130,246,0.1)" : "rgba(37,37,37,0.5)"}
          transition="all 0.2s"
          _hover={{ borderColor: "brand.muted" }}
        >
          {referenceImage ? (
            <Image src={referenceImage} alt="레퍼런스" h="56px" w="56px" rounded="lg" objectFit="cover" />
          ) : (
            <Flex h="56px" w="56px" rounded="lg" bg="brand.surface" align="center" justify="center">
              <Upload size={20} color="#6b6762" />
            </Flex>
          )}
          <Box textAlign="left">
            <Text fontSize="sm" fontWeight="medium" color="brand.text">직접 레퍼런스 업로드</Text>
            <Text fontSize="xs" color="brand.muted">원하는 스타일의 이미지를 업로드하세요</Text>
          </Box>
        </Flex>
      </Grid>

      <Flex align="center" justify="center" gap={3}>
        <Button variant="outline" onClick={onBack} borderColor="brand.surface" color="brand.text" _hover={{ bg: "brand.surface" }}>
          이전
        </Button>
        <Button
          onClick={onNext}
          isDisabled={!selectedStyle || isAnalyzing}
          colorScheme="blue"
          px={8}
          boxShadow="0 0 16px rgba(59, 130, 246, 0.35)"
        >
          {isAnalyzing ? "제품 분석 중..." : "다음단계"}
        </Button>
      </Flex>
    </Flex>
  );
}
