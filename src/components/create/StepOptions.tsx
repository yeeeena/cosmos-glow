import { Box, Button, Checkbox, Flex, Text, VStack } from "@chakra-ui/react";
import { Check, Image as ImageIcon, Sparkles } from "lucide-react";
import { AIRecommendation } from "./AIRecommendation";

interface DetailOptions {
  basicDetails: boolean;
  aiRecommended: boolean;
  selectedAIDetails: string[];
}

interface StepOptionsProps {
  detailOptions: DetailOptions;
  onDetailOptionsChange: (opts: DetailOptions) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export function StepOptions({ detailOptions, onDetailOptionsChange, onGenerate, onBack }: StepOptionsProps) {
  const totalCredits = 16 + (detailOptions.basicDetails ? 32 : 0) + (detailOptions.aiRecommended ? detailOptions.selectedAIDetails.length * 10 : 0);

  return (
    <Flex direction="column" flex={1} gap={8}>
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color="brand.accent">생성 옵션 선택</Text>
        <Text fontSize="sm" color="brand.muted">메인 컨셉샷 1장은 필수로 포함됩니다. 추가 상세컷을 선택하세요.</Text>
      </VStack>

      <VStack maxW="lg" mx="auto" w="full" spacing={4}>
        {/* Main shot - always included */}
        <Flex align="center" gap={3} p={4} rounded="xl" border="1px solid" borderColor="blue.500" bg="rgba(59,130,246,0.1)" w="full">
          <Flex h="40px" w="40px" rounded="lg" bg="rgba(59,130,246,0.2)" align="center" justify="center">
            <ImageIcon size={20} color="#3b82f6" />
          </Flex>
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="semibold" color="brand.accent">메인 컨셉샷 1장</Text>
            <Text fontSize="xs" color="brand.muted">필수 포함</Text>
          </Box>
          <Text fontSize="xs" fontWeight="medium" color="blue.400">16 credits</Text>
        </Flex>

        {/* Basic details */}
        <Flex
          as="button"
          onClick={() => onDetailOptionsChange({ ...detailOptions, basicDetails: !detailOptions.basicDetails })}
          w="full"
          align="center"
          gap={3}
          p={4}
          rounded="xl"
          border="2px solid"
          borderColor={detailOptions.basicDetails ? "blue.500" : "brand.surface"}
          bg={detailOptions.basicDetails ? "rgba(59,130,246,0.1)" : "brand.surface"}
          transition="all 0.2s"
          _hover={{ borderColor: detailOptions.basicDetails ? "blue.500" : "brand.muted" }}
          textAlign="left"
        >
          <Flex
            h="20px" w="20px" rounded="md" border="1px solid"
            borderColor={detailOptions.basicDetails ? "blue.500" : "brand.muted"}
            bg={detailOptions.basicDetails ? "blue.500" : "transparent"}
            align="center" justify="center" flexShrink={0}
          >
            {detailOptions.basicDetails && <Check size={12} color="white" />}
          </Flex>
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="semibold" color="brand.accent">기본 상세컷 3장</Text>
            <Text fontSize="xs" color="brand.muted">정면, 측면, 45도 앵글 등 범용 구도</Text>
          </Box>
          <Text fontSize="xs" fontWeight="medium" color="brand.muted">32 credits</Text>
        </Flex>

        {/* AI recommended */}
        <Flex
          as="button"
          onClick={() => onDetailOptionsChange({
            ...detailOptions,
            aiRecommended: !detailOptions.aiRecommended,
            selectedAIDetails: !detailOptions.aiRecommended ? ["case-open", "wearing-side", "touch-closeup"] : detailOptions.selectedAIDetails,
          })}
          w="full"
          align="center"
          gap={3}
          p={4}
          rounded="xl"
          border="2px solid"
          borderColor={detailOptions.aiRecommended ? "blue.500" : "brand.surface"}
          bg={detailOptions.aiRecommended ? "rgba(59,130,246,0.1)" : "brand.surface"}
          transition="all 0.2s"
          _hover={{ borderColor: detailOptions.aiRecommended ? "blue.500" : "brand.muted" }}
          textAlign="left"
        >
          <Flex
            h="20px" w="20px" rounded="md" border="1px solid"
            borderColor={detailOptions.aiRecommended ? "blue.500" : "brand.muted"}
            bg={detailOptions.aiRecommended ? "blue.500" : "transparent"}
            align="center" justify="center" flexShrink={0}
          >
            {detailOptions.aiRecommended && <Check size={12} color="white" />}
          </Flex>
          <Box flex={1}>
            <Flex align="center" gap={1.5}>
              <Text fontSize="sm" fontWeight="semibold" color="brand.accent">AI 추천 상세컷</Text>
              <Sparkles size={14} color="#3b82f6" />
            </Flex>
            <Text fontSize="xs" color="brand.muted">AI가 제품에 맞는 상세컷을 자동 제안</Text>
          </Box>
          <Text fontSize="xs" fontWeight="medium" color="brand.muted">~30 credits</Text>
        </Flex>

        {detailOptions.aiRecommended && (
          <AIRecommendation
            selectedDetails={detailOptions.selectedAIDetails}
            onSelectedChange={(details) => onDetailOptionsChange({ ...detailOptions, selectedAIDetails: details })}
          />
        )}
      </VStack>

      <Flex direction="column" align="center" gap={3}>
        <Flex align="center" gap={3}>
          <Button variant="outline" onClick={onBack} borderColor="brand.surface" color="brand.text" _hover={{ bg: "brand.surface" }}>이전</Button>
          <Button onClick={onGenerate} colorScheme="blue" px={8} boxShadow="0 0 16px rgba(59, 130, 246, 0.35)">
            생성하기 · {totalCredits} credits
          </Button>
        </Flex>
        <Text as="button" fontSize="xs" color="blue.400" _hover={{ textDecoration: "underline" }}>
          더 많은 실행 횟수 얻기
        </Text>
      </Flex>
    </Flex>
  );
}
