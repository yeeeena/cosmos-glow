

# 상세컷 배경색 통일: 사전 색상 감지 + 4장 동일 배경 적용

## 문제

현재 4장의 상세컷이 각각 독립된 API 호출로 생성되면서, 모델이 매번 제품 색상을 독자적으로 해석하여 배경색이 제각각 나옴.

## 해결 방법

상세컷 생성 전에 제품 색상을 한 번만 분석하고, 그 결과(배경 톤)를 4장 모두에 동일하게 전달.

## 변경 파일

### 1. Edge Function (`supabase/functions/analyze-product/index.ts`)

**새 액션 추가: `detect-color`**
- 제품 이미지를 받아 dominant color를 감지하고, 어울리는 pastel background tone 문자열을 반환
- `google/gemini-3-flash-preview` 사용 (빠르고 저렴)
- 반환 예시: `{ "detectedCategory": "BEAUTY", "dominantColor": "coral pink", "backgroundTone": "soft pastel coral pink" }`

**`generate-basic-details` 액션 수정**
- 새 파라미터 `detectedCategory`와 `backgroundTone`을 받도록 확장
- 시스템 프롬프트의 "Color Adaptation" 부분을 동적으로 교체:
  - 기존: "Extract the dominant product color..."
  - 변경: "The background tone has been pre-determined: **{backgroundTone}**. Use EXACTLY this tone for the background. Do NOT re-analyze or change the background color."
- `shotInstruction`에도 카테고리와 배경 톤을 명시적으로 삽입하여 모델이 재감지하지 않도록 강제

### 2. CreatePage (`src/pages/CreatePage.tsx`)

**`handleGenerate` 수정**
- `basicDetails`가 true일 때, `Promise.all` 실행 전에 먼저 `detect-color` 호출
- 반환된 `detectedCategory`와 `backgroundTone`을 4개 상세컷 호출에 동일하게 전달

## 기술 상세

### detect-color 액션 (Edge Function)

```text
입력: productImageBase64
처리: Gemini Flash로 제품 이미지 분석
프롬프트: "Analyze the product image. Return JSON:
  {
    'detectedCategory': 'BEAUTY' or 'TECH' or 'FOOD',
    'dominantColor': '1-2 word color description',
    'backgroundTone': 'soft pastel {color} studio background'
  }"
출력: { detectedCategory, dominantColor, backgroundTone }
```

### generate-basic-details 수정

```text
기존 shotInstruction:
  "Now generate ONLY Image {shotIndex} for the detected category."

변경 shotInstruction:
  "The product category is {detectedCategory}.
   MANDATORY BACKGROUND: Use exactly '{backgroundTone}' as the background for this image.
   Do NOT choose a different background color.
   Now generate ONLY [{detectedCategory} - Image {shotIndex}]."
```

시스템 프롬프트 내 Color Adaptation 섹션도 동적 교체하여 배경 톤을 강제 지정.

### CreatePage handleGenerate 흐름

```text
1. basicDetails가 true일 때:
   a. detect-color API 호출 -> { detectedCategory, backgroundTone }
   b. 메인샷 Promise + 상세컷 4장 Promise (모두 backgroundTone 전달) -> Promise.all
   c. 완료 후 결과 페이지 전환

2. basicDetails가 false일 때:
   a. 메인샷만 생성 (기존 로직 유지)
```

