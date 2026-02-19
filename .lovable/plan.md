

## VITE_GEMINI_API_KEY 시크릿 업데이트

### 작업 내용
- 기존 `VITE_GEMINI_API_KEY` 시크릿 값을 새 Gemini API 키로 교체합니다.
- 코드 변경은 없으며, 시크릿 값만 업데이트합니다.

### 진행 순서
1. `add_secret` 도구를 사용하여 새 API 키 입력을 요청합니다.
2. 사용자가 새 키를 입력하면 자동으로 반영됩니다.
3. Edge Function (`analyze-product`)이 즉시 새 키를 사용하게 됩니다.

### 참고
- 새 API 키는 [Google AI Studio](https://aistudio.google.com/apikey)에서 발급받을 수 있습니다.
- 기존 키가 할당량 초과(429 에러) 상태이므로, 빌링이 활성화된 프로젝트의 키를 사용하는 것을 권장합니다.

