

# 레퍼런스 이미지 분석 + 합성 기능 추가 & 크레딧 UI 제거

## 1. 크레딧 관련 UI 제거 (`src/components/create/StepOptions.tsx`)

- "16 credits", "32 credits", "~30 credits" 텍스트 모두 삭제
- `totalCredits` 계산 로직 삭제
- 생성하기 버튼: `생성하기 · {totalCredits} credits` -> `생성하기`
- "더 많은 실행 횟수 얻기" 링크 삭제

## 2. Edge Function에 `analyze-reference` 액션 추가 (`supabase/functions/analyze-product/index.ts`)

**모델**: `google/gemini-3-flash-preview` (기존 analyze와 동일)

레퍼런스 이미지를 받아 배경 컨셉을 영문 JSON으로 분석:

```text
시스템 프롬프트 (영문):
"You are a professional photography scene analyst.
Analyze this reference image and describe the background concept in detail.
Return ONLY a JSON object:
{
  "color_palette": "dominant colors and tones",
  "lighting": "lighting style and direction",
  "mood": "overall mood and atmosphere",
  "environment": "background environment description",
  "surface": "surface material the product should sit on"
}
Return ONLY the JSON. No markdown, no explanation."
```

응답 JSON을 파싱해서 `{ referenceAnalysis }` 반환

## 3. Edge Function의 `generate` 액션 확장

- `referenceImageBase64` 파라미터 추가 지원
- `referenceAnalysis` 객체 파라미터 추가 지원
- 두 값이 존재하면 아래 영문 프롬프트를 자동 구성:

```text
Product composite photography.
Reference scene analysis:
- Color palette: {color_palette}
- Lighting: {lighting}
- Mood: {mood}
- Environment: {environment}
- Surface: {surface}

Place the product from the first image into a scene matching this reference analysis.
Match the product's perspective, surface reflections, shadow direction and intensity
to the light sources in the background.
Reproduce all product label text and graphic elements sharply and without distortion.
The final result must look like a single cohesive photograph with physically consistent
lighting and material response throughout.
Preserve all brand logos, text, labels, proportions exactly.
No new text, no modifications to product structure. Photorealistic result.
```

- `userContent` 배열: [제품 이미지, 레퍼런스 이미지, 텍스트 프롬프트]
- 모델은 동일하게 `google/gemini-3-pro-image-preview` (Nanobanana Pro) 사용

## 4. 프론트엔드 로직 변경 (`src/pages/CreatePage.tsx`)

**새 state 추가:**
- `referenceAnalysis: object | null`

**`handleStyleNext` 변경:**
- `selectedStyle === "custom"` 분기 추가
- 레퍼런스 이미지를 base64로 변환 -> `analyze-reference` 액션 호출
- 분석 결과를 `referenceAnalysis` state에 저장
- 분석 중 로딩 화면 표시

**`handleGenerate` 변경:**
- `selectedStyle === "custom"` 분기 추가
- 제품 이미지 + 레퍼런스 이미지를 각각 base64로 변환
- `referenceAnalysis` 데이터와 함께 `generate` 액션 호출

**분석 로딩 텍스트 분기:**
- texture-concept: "AI가 제품을 분석 중입니다..." / "제품 특성에 맞는 텍스처를 자동으로 선택하고 있어요"
- custom: "AI가 레퍼런스를 분석 중입니다..." / "레퍼런스 이미지의 배경 컨셉을 추출하고 있어요"

**`handleRestart` 변경:**
- `referenceAnalysis`도 null로 초기화

## 처리 플로우 요약

```text
Step 1: 제품 이미지 업로드
Step 2: "직접 레퍼런스 업로드" 선택 + 레퍼런스 이미지 업로드
  -> "다음" 클릭
  -> gemini-3-flash-preview로 레퍼런스 배경 분석 (analyze-reference)
  -> 분석 결과 저장
Step 3: 비율 선택 + "생성하기" 클릭
  -> 제품 이미지 + 레퍼런스 이미지 + 분석 결과를 generate에 전달
  -> gemini-3-pro-image-preview (Nanobanana Pro)로 합성 이미지 생성
```
