import { Box, Flex, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <Flex align="center" gap={1.5}>
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <Flex key={i} align="center" gap={1.5}>
            {i > 0 && (
              <Box
                h="1px"
                w="24px"
                transition="background 0.2s"
                bg={isCompleted ? "blue.400" : "brand.surface"}
              />
            )}
            <Flex align="center" gap={1.5}>
              <Flex
                h="24px"
                w="24px"
                rounded="full"
                align="center"
                justify="center"
                fontSize="10px"
                fontWeight="semibold"
                transition="all 0.2s"
                bg={isActive || isCompleted ? "blue.500" : "brand.surface"}
                color={isActive || isCompleted ? "white" : "brand.muted"}
              >
                {isCompleted ? <Check size={12} /> : stepNum}
              </Flex>
              <Box display={{ base: "none", sm: "block" }}>
                <Text
                  fontSize="11px"
                  fontWeight="medium"
                  lineHeight="none"
                  color={isActive ? "brand.accent" : "brand.muted"}
                >
                  {step.label}
                </Text>
              </Box>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
}
