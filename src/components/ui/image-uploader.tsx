import { useRef, forwardRef, useCallback } from "react";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadFieldProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  error?: boolean;
  width?: string;
}

export const ImageUploadField = forwardRef<HTMLDivElement, ImageUploadFieldProps>(
  ({ value, onChange, error, width }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          onChange?.(url);
        }
      },
      [onChange]
    );

    const removeImage = useCallback(() => {
      onChange?.(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, [onChange]);

    return (
      <Box ref={ref} position="relative" w={width}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {value ? (
          <Box position="relative" role="group">
            <Image
              src={value}
              alt="업로드된 이미지"
              w="full"
              sx={{ aspectRatio: "1" }}
              rounded="xl"
              border="1px solid"
              borderColor="brand.surface"
              objectFit="contain"
              bg="brand.surface"
            />
            <Flex
              as="button"
              type="button"
              onClick={removeImage}
              position="absolute"
              top={2}
              right={2}
              h="28px"
              w="28px"
              rounded="full"
              bg="rgba(27,27,27,0.8)"
              backdropFilter="blur(4px)"
              align="center"
              justify="center"
              opacity={0}
              _groupHover={{ opacity: 1 }}
              transition="opacity 0.2s"
              _hover={{ bg: "red.500", color: "white" }}
              color="brand.text"
            >
              <X size={16} />
            </Flex>
          </Box>
        ) : (
          <Flex
            as="button"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            w="full"
            sx={{ aspectRatio: "1" }}
            rounded="2xl"
            border="2px dashed"
            borderColor={error ? "red.500" : "brand.surface"}
            bg="rgba(37,37,37,0.5)"
            direction="column"
            align="center"
            justify="center"
            gap={3}
            color="brand.muted"
            _hover={{ borderColor: "blue.500", color: "blue.400", bg: "rgba(59,130,246,0.05)" }}
            transition="all 0.2s"
            cursor="pointer"
          >
            <ImagePlus size={40} />
            <Box textAlign="center">
              <Text fontSize="sm" fontWeight="medium">클릭하여 업로드</Text>
              <Text fontSize="xs" mt={1}>PNG, JPG, WEBP</Text>
            </Box>
          </Flex>
        )}
      </Box>
    );
  }
);

ImageUploadField.displayName = "ImageUploadField";
