

# 3가지 동시 수정: analyze-main-shot + generate-ai-recommended 무드 주입 + CreatePage 흐름 변경

## 변경 파일

1. **`supabase/functions/analyze-product/index.ts`**
2. **`src/pages/CreatePage.tsx`**

## 변경 내용

### [1] Edge Function: `analyze-main-shot` 액션 추가

`generate-basic-details` 액션(현재 라인 545) 바로 위에 새로운 `analyze-main-shot` 액션을 추가합니다.

- 메인샷 이미지를 받아 Gemini Flash로 무드 분석 (lightingStyle, bgTone, colorTemperature, moodKeywords, compositionStyle, overallAesthetic)
- JSON 반환, 파싱 실패 시 500 에러
- rate limit (429/402) 처리 포함

### [2] Edge Function: `generate-ai-recommended` 액션 추가 + 무드 주입

현재 `generate-ai-recommended` 액션은 존재하지 않으므로, `generate-basic-details` 액션 뒤(라인 714 부근)에 새로 생성합니다.

- `productImageBase64`, `shotIndex`, `mainShotMood`, `aspectRatio`, `shotLabel` 파라미터 수용
- `mainShotMood`가 있을 때 시스템 프롬프트 상단에 "VISUAL CONSISTENCY REFERENCE" 섹션을 동적 삽입
- 메인샷의 조명, 배경 톤, 색온도, 구도, 분위기를 그대로 재현하도록 강제
- `mainShotMood`가 null이면 무드 섹션 없이 기본 생성
- image generation 모델(`google/gemini-3-pro-image-preview`) 사용
- rate limit 및 이미지 추출 로직은 기존 패턴과 동일

### [3] CreatePage: `handleGenerate` 흐름에 무드 분석 단계 추가

현재 `handleGenerate`에서 메인샷 + 기본 상세컷만 `Promise.all`로 병렬 실행하고 있습니다. 이를 다음 순서로 변경합니다:

1. 메인샷 생성 (기존 로직 유지)
2. `detailOptions.aiRecommended`가 true이고 메인샷 이미지가 있을 때:
   - `analyze-main-shot` 호출하여 `mainShotMood` 획득
   - 실패 시 `mainShotMood = null`로 정상 진행
3. AI 추천 상세컷 생성 시 `mainShotMood`를 body에 포함하여 `generate-ai-recommended` 호출
4. 기본 상세컷(basicDetails)은 기존처럼 병렬 생성 유지

실행 순서:
```text
메인샷 생성 + 기본 상세컷 4장 (병렬, 기존 로직)
    ↓ (메인샷 완료 후)
analyze-main-shot (aiRecommended가 true일 때)
    ↓
generate-ai-recommended x N장 (선택된 AI 상세컷, 병렬)
    ↓
결과 페이지 전환
```

무드 분석 실패 시에도 `mainShotMood: null`로 정상 진행되며, AI 추천 상세컷은 무드 없이 독립적으로 생성됩니다.

## 기술 상세

### analyze-main-shot 액션 구조

```text
입력: mainShotImageBase64
모델: google/gemini-3-flash-preview (텍스트 분석용, 빠르고 저렴)
출력: { moodData: { lightingStyle, bgTone, colorTemperature, moodKeywords, compositionStyle, overallAesthetic } }
```

### generate-ai-recommended 무드 섹션

`mainShotMood`가 존재할 때 시스템 프롬프트 앞에 삽입되는 블록:
- Lighting Style, Background Tone, Color Temperature, Composition Style, Mood Keywords, Overall Aesthetic
- MANDATORY RULES: 배경 톤 정확 재현, 동일 조명 방향/품질, 동일 색온도, 동일 시리즈 느낌 강제

### CreatePage handleGenerate 변경 요약

- 메인샷 결과(`mainImage`)를 먼저 받은 후 무드 분석 호출
- `selectedAIDetails` 배열의 각 항목에 대해 `generate-ai-recommended` 병렬 호출
- 결과를 `generatedDetailImages`에 `ai-{id}` 키로 저장
- 배포까지 자동 수행

