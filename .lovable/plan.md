

# 제품 분석 로딩 무한 대기 문제 해결

## 문제 원인

1. **Edge Function 타임아웃**: `analyze-details` 액션이 AI 게이트웨이를 호출하는데, 큰 이미지(base64)를 보내면 AI 처리 시간이 Edge Function 타임아웃(150초)을 초과합니다.
2. **클라이언트 타임아웃 없음**: `supabase.functions.invoke`는 기본적으로 무한 대기합니다. 응답이 안 오면 `isAnalyzing`이 영원히 `true`로 남아 로딩 화면이 사라지지 않습니다.
3. **에러 처리 미흡**: 타임아웃 시 사용자에게 피드백이 없습니다.

## 해결 방안

### 1. 클라이언트: AbortController로 타임아웃 추가 (CreatePage.tsx)

`analyze-details` 호출에 60초 타임아웃을 설정합니다. 타임아웃 발생 시 분석 결과 없이 다음 단계로 진행하도록 합니다 (상세컷 추천은 선택 기능이므로).

- StepUpload의 `onNext` 콜백에서 `supabase.functions.invoke` 호출 시 `AbortSignal.timeout(60000)` 사용
- 타임아웃 발생 시 toast로 "분석 시간이 초과되었습니다" 안내 후 `setCurrentStep(2)`로 진행

### 2. 이미지 리사이징으로 페이로드 축소

업로드된 이미지를 서버로 보내기 전에 Canvas API로 최대 1024px로 리사이징합니다. 이렇게 하면:
- base64 크기가 크게 줄어듦
- AI 게이트웨이 처리 시간 단축
- 타임아웃 가능성 감소

`CreatePage.tsx`에 `resizeImage` 유틸 함수를 추가하고, `analyze-details`, `analyze` (texture), `analyze-reference` 호출 전에 모두 적용합니다.

### 3. Edge Function: 로그 추가 (analyze-product/index.ts)

디버깅을 위해 각 액션 시작/완료 시점에 `console.log`를 추가합니다.

---

## 기술 상세

### CreatePage.tsx 변경 사항

```text
1. resizeImage 헬퍼 함수 추가 (Canvas API, 최대 1024px)
2. StepUpload onNext: AbortSignal.timeout(60000) 추가 + catch에서 분석 실패 시에도 다음 단계 진행
3. analyzeProductForTexture: 이미지 리사이즈 적용
4. analyzeReference: 이미지 리사이즈 적용
```

### analyze-product/index.ts 변경 사항

```text
1. 각 action 진입 시 console.log 추가 (예: "Action: analyze-details started")
2. AI 호출 전후 console.log 추가
```

이 수정으로 로딩이 무한 대기되는 문제가 해결되고, 이미지 리사이징으로 분석 성공률도 높아집니다.
