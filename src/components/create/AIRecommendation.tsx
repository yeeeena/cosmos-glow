import { Box, Checkbox, Flex, Text, VStack } from "@chakra-ui/react";
import { Sparkles } from "lucide-react";

const MOCK_AI_RECOMMENDATIONS = {
  category: "무선 이어폰",
  details: [
    { id: "case-open", label: "충전 케이스 오픈 샷", defaultChecked: true },
    { id: "wearing-side", label: "착용감 강조 측면 컷", defaultChecked: true },
    { id: "touch-closeup", label: "터치 버튼 조작부 클로즈업", defaultChecked: true },
    { id: "size-compare", label: "크기 비교 컷", defaultChecked: false },
  ],
};

interface AIRecommendationProps {
  selectedDetails: string[];
  onSelectedChange: (details: string[]) => void;
}

export function AIRecommendation({ selectedDetails, onSelectedChange }: AIRecommendationProps) {
  const toggleDetail = (id: string) => {
    if (selectedDetails.includes(id)) {
      onSelectedChange(selectedDetails.filter((d) => d !== id));
    } else {
      onSelectedChange([...selectedDetails, id]);
    }
  };

  return (
    <Box rounded="xl" border="1px solid" borderColor="rgba(59,130,246,0.3)" bg="rgba(59,130,246,0.05)" p={4} w="full">
      <VStack spacing={3} align="start">
        <Flex align="center" gap={2}>
          <Sparkles size={16} color="#3b82f6" />
          <Text fontSize="sm" fontWeight="semibold" color="blue.400">AI가 이 제품을 분석했어요</Text>
        </Flex>
        <Text fontSize="xs" color="brand.muted">
          제품 카테고리: <Text as="span" color="brand.accent" fontWeight="medium">{MOCK_AI_RECOMMENDATIONS.category}</Text>
        </Text>
        <VStack spacing={2} align="start" w="full">
          <Text fontSize="xs" fontWeight="medium" color="brand.muted">추천 상세컷:</Text>
          {MOCK_AI_RECOMMENDATIONS.details.map((detail) => (
            <Checkbox
              key={detail.id}
              isChecked={selectedDetails.includes(detail.id)}
              onChange={() => toggleDetail(detail.id)}
              colorScheme="blue"
              size="sm"
            >
              <Text fontSize="sm" color="brand.text" _hover={{ color: "brand.accent" }} transition="color 0.2s">
                {detail.label}
              </Text>
            </Checkbox>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
