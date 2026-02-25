
# 상세컷 2장 축소 + 순차 생성 + Hex 배경색 개선

## 변경 요약

3가지 개선을 동시에 적용합니다:
1. 상세컷 4장 → 2장 축소 (카테고리별 선택된 샷만 유지)
2. 순차 생성 (Image 1 먼저 → Image 2에 참조 전달)
3. detect-color에서 RGB hex 코드 추출하여 배경 일관성 강화

## 카테고리별 유지 샷

| 카테고리 | Shot 1 | Shot 2 |
|---------|--------|--------|
| BEAUTY | Image 2 (Top-Down Flat Lay) | Image 4 (Hand & Product Portrait) |
| TECH | Image 1 (Hero Front View) | Image 2 (Angled 3/4 View) |
| FOOD | Image 1 (Package + Food Composition) | Image 4 (Hero Lifestyle Angle) |

## 변경 파일 및 내용

### [1] `supabase/functions/analyze-product/index.ts`

**detect-color 액션 수정:**
- 프롬프트에 `backgroundHex` 필드 추가 요청
- 반환값: `{ detectedCategory, dominantColor, backgroundHex: "#F5E6E0", backgroundTone: "..." }`

**generate-basic-details 액션 수정:**
- 시스템 프롬프트에서 각 카테고리 샷 리스트를 2장으로 축소 (유저 지정 샷만 유지)
- "all 4 images" 등의 표현을 "all 2 images" / "both images"로 변경
- `backgroundColorSection`에 hex 코드 강제 삽입: "Use EXACTLY this hex color: #XXXXXX"
- 새 파라미터 `referenceImageBase64` 수용: shotIndex=2일 때 Image 1 결과를 참조 이미지로 받아 userContent에 추가하고, "Match the background, lighting, surface of this reference image EXACTLY" 지시 삽입

**shotIndex 매핑:**
- `detectedCategory`와 `shotIndex`(1 또는 2)를 조합하여 올바른 Shot 지시를 선택
- 예: BEAUTY + shotIndex 1 → "Image 2: Top-Down Flat Lay", BEAUTY + shotIndex 2 → "Image 4: Hand & Product Portrait"

### [2] `src/pages/CreatePage.tsx`

**handleGenerate 함수 변경:**
- 기본 상세컷 루프를 `for (let i = 1; i <= 4)` → `for (let i = 1; i <= 2)`로 변경
- 순차 생성 로직:
  1. 메인샷 + detect-color를 병렬 실행 (기존과 동일)
  2. detect-color 완료 후, 상세컷 Image 1(shotIndex=1)만 단독 생성
  3. Image 1 결과를 `referenceImageBase64`로 전달하며 Image 2(shotIndex=2) 생성
- `backgroundHex`를 detect-color 결과에서 추출하여 상세컷 생성 body에 포함

**로딩 메시지 업데이트:**
- "메인 컨셉샷 + 상세컷 4장" → "메인 컨셉샷 + 상세컷 2장"

### [3] `src/components/create/ResultView.tsx`

**buildResults 함수 변경:**
- basicResults를 4개에서 2개로 축소:
```text
{ id: "basic-1", label: "Image 1" },
{ id: "basic-2", label: "Image 2" },
```

## 실행 순서 (변경 후)

```text
메인샷 생성 + detect-color (병렬)
    |
상세컷 Shot 1 단독 생성 (hex 배경 강제)
    |
상세컷 Shot 2 생성 (Shot 1 결과를 참조 이미지로 전달 + hex 배경 강제)
    |
(AI 추천 상세컷이 있으면) analyze-main-shot → AI 추천 병렬 생성
    |
결과 페이지 전환
```

## 기술 상세

### detect-color 변경된 프롬프트 반환 스키마

```text
{
  "detectedCategory": "BEAUTY",
  "dominantColor": "coral pink",
  "backgroundHex": "#F5E6E0",
  "backgroundTone": "very light near-white coral-tinted studio background"
}
```

### generate-basic-details 참조 이미지 처리

shotIndex=2이고 `referenceImageBase64`가 존재할 때:
- userContent 배열에 참조 이미지를 추가 (product image + reference image + text instruction)
- shotInstruction에 "The second image is the reference shot (Shot 1). Match its background color, lighting direction, surface texture, and overall color grade EXACTLY." 삽입

### 배경 hex 강제 적용

`backgroundHex`가 존재할 때 backgroundColorSection에 삽입:
```text
BACKGROUND COLOR
Use EXACTLY this hex color as the background: #F5E6E0
The background must be this exact color with bright white studio lighting.
This exact background color must appear identically in both images.
```
