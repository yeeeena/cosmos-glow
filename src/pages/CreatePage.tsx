import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
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

const CreatePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [detailOptions, setDetailOptions] = useState<DetailOptions>({
    basicDetails: false,
    aiRecommended: false,
    selectedAIDetails: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    setShowResult(true);
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setProductImage(null);
    setSelectedStyle(null);
    setReferenceImage(null);
    setDetailOptions({ basicDetails: false, aiRecommended: false, selectedAIDetails: [] });
    setShowResult(false);
    setIsGenerating(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="shrink-0 px-6 py-3 border-b border-border/50 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-muted-foreground">컨셉샷 생성</h1>
          {!showResult && <StepIndicator currentStep={currentStep} steps={STEPS} />}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex">
          {showResult ? (
            <ResultView isGenerating={isGenerating} onRestart={handleRestart} />
          ) : currentStep === 1 ? (
            <StepUpload
              productImage={productImage}
              onImageChange={setProductImage}
              onNext={() => setCurrentStep(2)}
            />
          ) : currentStep === 2 ? (
            <StepStyle
              selectedStyle={selectedStyle}
              referenceImage={referenceImage}
              onStyleChange={setSelectedStyle}
              onReferenceChange={setReferenceImage}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          ) : (
            <StepOptions
              detailOptions={detailOptions}
              onDetailOptionsChange={setDetailOptions}
              onGenerate={handleGenerate}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CreatePage;
