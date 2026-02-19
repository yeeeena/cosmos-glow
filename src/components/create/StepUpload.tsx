import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { ImageUploadField } from "@/components/ui/image-uploader";

interface StepUploadProps {
  productImage: string | null;
  onImageChange: (url: string | null) => void;
  onNext: () => void;
}

export function StepUpload({ productImage, onImageChange, onNext }: StepUploadProps) {
  return (
    <Flex direction="column" align="center" justify="center" flex={1} gap={8}>
      <VStack spacing={2} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" color="brand.accent">
          제품 이미지 업로드
        </Text>
        <Text fontSize="sm" color="brand.muted">
          컨셉샷으로 변환할 제품 이미지 1장을 업로드하세요
        </Text>
      </VStack>

      <ImageUploadField
        value={productImage}
        onChange={onImageChange}
        width="256px"
      />

      <Button
        onClick={onNext}
        isDisabled={!productImage}
        colorScheme="blue"
        px={8}
        _hover={{ opacity: 0.9 }}
        boxShadow="0 0 16px rgba(59, 130, 246, 0.35)"
      >
        다음단계
      </Button>
    </Flex>
  );
}
