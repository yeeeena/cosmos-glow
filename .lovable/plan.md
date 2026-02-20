

# 이미지 비율(Aspect Ratio) 선택 기능 추가

## 요약
STEP 3(생성 옵션) 화면에서 **메인 컨셉샷**, **기본 상세컷**, **AI 추천 상세컷** 각각에 대해 이미지 비율을 선택할 수 있는 UI를 추가합니다. 선택된 비율은 실제 이미지 생성 시 프롬프트에 반영되고, 결과 화면에서도 해당 비율로 표시됩니다.

## UI 배치 제안

STEP 3의 각 옵션 카드 아래에 비율 선택 버튼 그룹을 배치합니다:

```text
+---------------------------------------------+
| [이미지] 메인 컨셉샷 1장        16 credits   |
|   비율: [1:1] [9:16] [16:9] [3:4] [4:3]     |
+---------------------------------------------+

+---------------------------------------------+
| [v] 기본 상세컷 3장             32 credits   |
|   비율: [1:1] [9:16] [16:9] [3:4] [4:3]     |
+---------------------------------------------+

+---------------------------------------------+
| [v] AI 추천 상세컷              ~30 credits  |
|   비율: [1:1] [9:16] [16:9] [3:4] [4:3]     |
+---------------------------------------------+
```

- 각 비율 버튼은 토글 그룹(단일 선택)으로 구현
- 기본 선택값: 메인은 `1:1`, 상세컷/AI 상세컷은 `1:1`
- 선택된 버튼은 파란 배경 강조

## 변경 파일

### 1. `src/pages/CreatePage.tsx`
- `DetailOptions` 인터페이스에 비율 필드 3개 추가:
  - `mainAspectRatio: string` (기본값 `"1:1"`)
  - `basicAspectRatio: string` (기본값 `"1:1"`)
  - `aiAspectRatio: string` (기본값 `"1:1"`)
- `handleGenerate` 함수에서 선택된 비율을 프롬프트에 포함 (예: `"aspect ratio 9:16, portrait orientation"`)
- Edge Function 호출 시 `aspectRatio` 파라미터 전달

### 2. `src/components/create/StepOptions.tsx`
- 메인 컨셉샷 카드 하단에 비율 선택 버튼 그룹 추가
- 기본 상세컷 카드 하단에 비율 선택 버튼 그룹 추가 (체크 시에만 표시)
- AI 추천 상세컷 카드 하단에 비율 선택 버튼 그룹 추가 (체크 시에만 표시)
- 새로운 `AspectRatioSelector` 컴포넌트를 인라인 또는 별도 파일로 생성

### 3. `src/components/create/ResultView.tsx`
- `DetailOptions`에 추가된 비율 필드를 받아서 결과 이미지 컨테이너의 `aspect-ratio` CSS를 동적으로 적용
  - 메인 컨셉샷: `mainAspectRatio`에 따라 `aspect-[1/1]`, `aspect-[9/16]` 등
  - 기본 상세컷: `basicAspectRatio`에 따라 적용
  - AI 상세컷: `aiAspectRatio`에 따라 적용

### 4. `supabase/functions/analyze-product/index.ts`
- `generate` 액션에서 `aspectRatio` 파라미터를 받아 프롬프트에 비율 지시어 추가
  - `"1:1"` -> `"square 1:1 aspect ratio"`
  - `"9:16"` -> `"vertical portrait 9:16 aspect ratio"`
  - `"16:9"` -> `"horizontal landscape 16:9 aspect ratio"`
  - `"3:4"` -> `"vertical 3:4 aspect ratio"`
  - `"4:3"` -> `"horizontal 4:3 aspect ratio"`

## 기술 세부사항

### AspectRatioSelector 컴포넌트
```text
props:
  - value: string ("1:1" | "9:16" | "16:9" | "3:4" | "4:3")
  - onChange: (ratio: string) => void

UI: 5개의 작은 버튼이 가로로 나열, 선택된 것만 primary 색상 강조
```

### 비율-CSS 매핑
| 비율 | CSS aspect-ratio | 설명 |
|------|-------------------|------|
| 1:1 | aspect-[1/1] | 정사각형 |
| 9:16 | aspect-[9/16] | 세로형 (릴스/스토리) |
| 16:9 | aspect-[16/9] | 가로형 (유튜브) |
| 3:4 | aspect-[3/4] | 세로형 (인스타) |
| 4:3 | aspect-[4/3] | 가로형 (클래식) |

