import { Box, Button, Flex, Grid, Image, Text, VStack } from "@chakra-ui/react";
import { Download, RefreshCw, ArrowLeft } from "lucide-react";

interface DetailOptions {
  basicDetails: boolean;
  aiRecommended: boolean;
  selectedAIDetails: string[];
}

interface ResultViewProps {
  isGenerating: boolean;
  onRestart: () => void;
  detailOptions: DetailOptions;
  generatedImage?: string | null;
}

const AI_DETAIL_LABELS: Record<string, string> = {
  "case-open": "충전 케이스 오픈 샷",
  "wearing-side": "착용감 강조 측면 컷",
  "touch-closeup": "터치 버튼 조작부 클로즈업",
  "size-compare": "크기 비교 컷",
};

function buildResults(options: DetailOptions) {
  const results: { id: string; label: string; isMain?: boolean }[] = [
    { id: "main", label: "메인 컨셉샷", isMain: true },
  ];
  if (options.basicDetails) {
    results.push({ id: "basic-1", label: "정면 컷" }, { id: "basic-2", label: "측면 컷" }, { id: "basic-3", label: "45도 앵글 컷" });
  }
  if (options.aiRecommended) {
    options.selectedAIDetails.forEach((id) => {
      results.push({ id, label: AI_DETAIL_LABELS[id] || id });
    });
  }
  return results;
}

export function ResultView({ isGenerating, onRestart, detailOptions, generatedImage }: ResultViewProps) {
  const results = buildResults(detailOptions);
  const detailResults = results.filter((r) => !r.isMain);

  if (isGenerating) {
    return (
      <Flex direction="column" align="center" justify="center" flex={1} gap={6}>
        <Box position="relative" h="64px" w="64px">
          <Box position="absolute" inset={0} rounded="full" border="4px solid" borderColor="brand.surface" />
          <Box
            position="absolute" inset={0} rounded="full" border="4px solid" borderColor="blue.500"
            borderTopColor="transparent"
            animation="spin 1s linear infinite"
            sx={{ "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }}
          />
        </Box>
        <VStack spacing={1} textAlign="center">
          <Text fontSize="lg" fontWeight="semibold" color="brand.accent">컨셉샷 생성 중...</Text>
          <Text fontSize="sm" color="brand.muted">총 {results.length}장 · 약 30초 정도 소요됩니다</Text>
        </VStack>
        <Box w="256px" h="8px" bg="brand.surface" rounded="full" overflow="hidden">
          <Box
            h="full" bg="blue.500" rounded="full" w="66%"
            animation="pulse 2s ease-in-out infinite"
            sx={{ "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } } }}
          />
        </Box>
      </Flex>
    );
  }

  return (
    <Flex direction="column" flex={1} gap={6}>
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color="brand.accent">생성 완료! 🎉</Text>
        <Text fontSize="sm" color="brand.muted">총 {results.length}장의 컨셉샷이 준비되었습니다</Text>
      </VStack>

      {/* Main concept shot */}
      <Box maxW="2xl" mx="auto" w="full">
        <Box position="relative" role="group">
          <Flex
            sx={{ aspectRatio: "16/10" }}
            rounded="xl"
            border="1px solid"
            borderColor="brand.surface"
            bg="brand.surface"
            align="center"
            justify="center"
            overflow="hidden"
          >
            {generatedImage ? (
              <Image src={generatedImage} alt="생성된 컨셉샷" w="full" h="full" objectFit="contain" />
            ) : (
              <Text color="brand.muted" fontSize="sm">메인 컨셉샷 미리보기</Text>
            )}
          </Flex>
          <Flex
            position="absolute" top={2} right={2} gap={1}
            opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s"
          >
            <Flex as="button" h="32px" w="32px" rounded="lg" bg="rgba(27,27,27,0.8)" backdropFilter="blur(4px)" align="center" justify="center" _hover={{ bg: "brand.surface" }} color="brand.text">
              <Download size={16} />
            </Flex>
            <Flex as="button" h="32px" w="32px" rounded="lg" bg="rgba(27,27,27,0.8)" backdropFilter="blur(4px)" align="center" justify="center" _hover={{ bg: "brand.surface" }} color="brand.text">
              <RefreshCw size={16} />
            </Flex>
          </Flex>
        </Box>
      </Box>

      {/* Detail shots grid */}
      {detailResults.length > 0 && (
        <Grid maxW="2xl" mx="auto" w="full" templateColumns="repeat(3, 1fr)" gap={3}>
          {detailResults.map((result) => (
            <Box key={result.id} position="relative" role="group">
              <Flex sx={{ aspectRatio: "1" }} rounded="xl" border="1px solid" borderColor="brand.surface" bg="brand.surface" align="center" justify="center">
                <Text color="brand.muted" fontSize="xs" textAlign="center" px={2}>{result.label}</Text>
              </Flex>
              <Flex position="absolute" top={1.5} right={1.5} gap={1} opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
                <Flex as="button" h="24px" w="24px" rounded="md" bg="rgba(27,27,27,0.8)" backdropFilter="blur(4px)" align="center" justify="center" _hover={{ bg: "brand.surface" }} color="brand.text">
                  <Download size={12} />
                </Flex>
                <Flex as="button" h="24px" w="24px" rounded="md" bg="rgba(27,27,27,0.8)" backdropFilter="blur(4px)" align="center" justify="center" _hover={{ bg: "brand.surface" }} color="brand.text">
                  <RefreshCw size={12} />
                </Flex>
              </Flex>
            </Box>
          ))}
        </Grid>
      )}

      {/* Actions */}
      <Flex align="center" justify="center" gap={3} pb={16}>
        <Button variant="outline" onClick={onRestart} borderColor="brand.surface" color="brand.text" _hover={{ bg: "brand.surface" }}>
          <ArrowLeft size={16} />
          <Text ml={2}>새로 만들기</Text>
        </Button>
        <Button colorScheme="blue" px={6} boxShadow="0 0 16px rgba(59, 130, 246, 0.35)">
          <Download size={16} />
          <Text ml={2}>ZIP 다운로드</Text>
        </Button>
      </Flex>
    </Flex>
  );
}
