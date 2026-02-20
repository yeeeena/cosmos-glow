

# Lovable AI 게이트웨이로 전환

## 요약
기존 Gemini API 직접 호출(VITE_GEMINI_API_KEY 사용)을 Lovable AI 게이트웨이(LOVABLE_API_KEY 자동 제공)로 전환합니다. 별도 API 키 관리가 필요 없어집니다.

## 사용 모델
- **제품 분석**: `google/gemini-3-flash-preview` (멀티모달 - 이미지+텍스트 입력, JSON 출력)
- **이미지 생성**: `google/gemini-3-pro-image-preview` (텍스트 프롬프트 -> 이미지 생성)

## 변경 사항

### 1. Edge Function 전면 재작성 (`supabase/functions/analyze-product/index.ts`)

**제거:**
- `VITE_GEMINI_API_KEY` 환경변수 참조
- `generativelanguage.googleapis.com` 직접 호출

**변경:**
- Lovable AI 게이트웨이 (`https://ai.gateway.lovable.dev/v1/chat/completions`) 사용
- `LOVABLE_API_KEY` (자동 제공) 사용
- OpenAI 호환 형식으로 요청 구성

**analyze 액션:**
- 모델: `google/gemini-3-flash-preview`
- 이미지를 OpenAI 형식의 `image_url` content part로 전달 (base64 data URL)
- 시스템 프롬프트는 기존과 동일 유지
- 응답에서 JSON 파싱 후 텍스처 프롬프트 조합 로직 유지

**generate 액션:**
- 모델: `google/gemini-3-pro-image-preview`
- 텍스트 프롬프트를 user message로 전달
- 응답에서 이미지 데이터 추출

### 2. config.toml 업데이트
- `analyze-product` 함수에 `verify_jwt = false` 설정 추가

### 3. 프론트엔드 (`src/pages/CreatePage.tsx`)
- 코드 변경 없음 (이미 `supabase.functions.invoke` 사용 중)

### 4. 에러 핸들링
- 429 (Rate Limit) 및 402 (Payment Required) 에러를 감지하여 사용자에게 적절한 메시지 표시

## 장점
- API 키 만료/할당량 문제 해결
- 별도 API 키 관리 불필요 (LOVABLE_API_KEY 자동 제공)
- 최신 모델 사용 가능

