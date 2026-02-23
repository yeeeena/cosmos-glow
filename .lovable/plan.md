

# 상세컷 배경색을 더 연한 파스텔(거의 화이트)로 조정

## 변경 파일

**`supabase/functions/analyze-product/index.ts`** 단일 파일 수정

## 변경 내용

### 1. `detect-color` 프롬프트 수정 (라인 492-500)

배경 톤 생성 지시를 "soft pastel"에서 "very light, near-white pastel with white studio lighting"으로 변경합니다.

**기존:**
```
"backgroundTone": "soft pastel [color] studio background"
The backgroundTone should be a lighter, desaturated pastel variation of the dominant product color, suitable as a studio backdrop.
```

**변경:**
```
"backgroundTone": "very light near-white [color]-tinted studio background with bright white lighting"
The backgroundTone must be an extremely light, almost white pastel tint derived from the dominant product color. 
Think of it as a white studio background with just a subtle hint of the product color. 
The background should look nearly white with soft white studio lighting — only a faint trace of color should be visible.
```

### 2. `generate-basic-details` Color Adaptation 섹션 보강 (라인 558-562)

pre-determined 배경 톤 지시문에 "near-white, bright white lighting" 강조를 추가합니다.

**기존:**
```
Use EXACTLY this tone for the background. Do NOT re-analyze or change the background color.
```

**변경:**
```
Use EXACTLY this tone for the background. The background must appear nearly white with bright white studio lighting 
and only a very subtle hint of color. Do NOT re-analyze or change the background color. Do NOT make the background saturated.
```

## 효과

- 배경이 거의 하얀색에 가까운 아주 연한 파스텔 톤으로 생성됨
- 화이트 스튜디오 조명이 강조되어 밝고 깨끗한 느낌
- 4장 모두 동일한 톤 유지 (기존 detect-color 파이프라인 활용)

