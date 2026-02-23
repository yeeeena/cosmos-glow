
# 기본 상세컷 3장 -> 4장 변경 + 카테고리별 프롬프트 적용

## 변경 요약

기본 상세컷을 3장에서 4장으로 변경하고, 메인 컨셉샷 생성에 사용하는 동일한 Gemini 모델(`google/gemini-3-pro-image-preview`)을 사용하여 카테고리(BEAUTY/TECH/FOOD)별 맞춤 프롬프트로 상세컷을 생성합니다.

## 변경 파일 및 내용

### 1. `src/components/create/StepOptions.tsx`
- "기본 상세컷 3장" 텍스트를 "기본 상세컷 4장"으로 변경

### 2. `src/components/create/ResultView.tsx`
- `buildResults` 함수에서 기본 상세컷 3개를 4개로 변경
- 기존: 정면 컷, 측면 컷, 45도 앵글 컷
- 변경: Image 1, Image 2, Image 3, Image 4 (카테고리별 라벨은 생성 후 동적으로 표시하거나 범용 라벨 사용)

### 3. `supabase/functions/analyze-product/index.ts`
- 새로운 액션 `generate-basic-details` 추가 (또는 기존 `generate` 액션에 `type: "basic-detail"` 파라미터 추가)
- 사용자가 제공한 전체 프롬프트를 시스템 프롬프트로 설정
- 제품 이미지와 함께 `google/gemini-3-pro-image-preview` 모델로 4장의 이미지를 **개별적으로** 생성
- 카테고리 감지 -> 카테고리별 Shot List에 따라 4장 각각 별도 호출

### 4. `src/pages/CreatePage.tsx`
- `handleGenerate` 함수에서 `basicDetails` 옵션이 선택된 경우, 기본 상세컷 4장을 생성하는 로직 추가
- 각 상세컷 이미지를 개별적으로 저장할 state 추가 (`generatedDetailImages`)
- 메인 컨셉샷 생성 후, 순차적으로 4장의 상세컷 생성 API 호출

## 기술 상세

### Edge Function 변경 (`analyze-product/index.ts`)

새로운 액션 `generate-basic-details` 추가:

```text
입력: productImageBase64, shotIndex (1-4)
처리:
  1. 제품 이미지를 분석하여 카테고리 자동 감지 (BEAUTY/TECH/FOOD)
  2. 감지된 카테고리에 해당하는 Shot List에서 해당 shotIndex의 프롬프트 선택
  3. google/gemini-3-pro-image-preview 모델로 이미지 생성
  4. 생성된 이미지 반환
```

사용자가 제공한 전체 프롬프트를 시스템 프롬프트로 사용하되, 각 호출마다 특정 Shot 번호(Image 1~4)만 생성하도록 지시합니다.

### CreatePage.tsx 변경

```text
1. generatedDetailImages state 추가: Record<string, string> (id -> dataUri)
2. handleGenerate에서:
   a. 메인 컨셉샷 생성 (기존 로직)
   b. basicDetails가 true이면:
      - shotIndex 1~4로 순차적으로 generate-basic-details 호출
      - 각 결과를 generatedDetailImages에 저장
3. generatedDetailImages를 ResultView에 전달
```

### ResultView.tsx 변경

```text
1. 기본 상세컷 4개로 변경 (basic-1 ~ basic-4)
2. generatedDetailImages prop 추가
3. 각 상세컷 카드에 생성된 이미지 표시
4. 다운로드/ZIP에 상세컷 이미지 포함
```
