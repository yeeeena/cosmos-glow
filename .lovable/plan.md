
# 결과 페이지 UI 개선: 섹션 구분 + 이미지 크기 통일 + 확대보기

## 변경 파일

**`src/components/create/ResultView.tsx`** 단일 파일 수정

## 변경 내용

### 1. 메인컷 / 상세컷 섹션 구분
- 메인 컨셉샷 위에 "메인 컨셉샷" 섹션 제목 추가
- 상세컷 그리드 위에 "기본 상세컷" 섹션 제목 추가
- AI 추천 상세컷이 있는 경우 별도 "AI 추천 상세컷" 섹션 제목 추가

### 2. 이미지 크기 256px x 256px 통일
- 메인 컨셉샷과 상세컷 모두 동일하게 256px x 256px 고정 크기로 변경
- 기존 aspect ratio 기반 크기 대신 `w-64 h-64` (256px) 고정 적용
- 메인컷도 상세컷과 동일 크기로, 그리드 레이아웃에 함께 배치

### 3. 이미지 확대보기 버튼 추가
- `lucide-react`에서 `Maximize2` (또는 `ZoomIn`) 아이콘 import
- 각 이미지 hover 시 다운로드 버튼 옆에 확대보기 버튼 추가 (동일한 스타일)
- 클릭 시 `Dialog` 컴포넌트로 이미지를 큰 사이즈로 표시
- Dialog 내에서도 다운로드 버튼 제공

## 기술 상세

### 확대보기 Dialog
- `@radix-ui/react-dialog` 기반 기존 `Dialog` 컴포넌트 활용
- `useState`로 `previewImage: { src: string; label: string } | null` 상태 관리
- Dialog 열릴 때 해당 이미지 src와 label 설정
- Dialog 내부: 이미지를 `max-w-full max-h-[80vh] object-contain`으로 표시

### 레이아웃 구조 변경

```text
[생성 완료! 제목]

--- 메인 컨셉샷 ---
[256x256 이미지 카드] (다운로드 + 확대 버튼)

--- 기본 상세컷 ---
[256x256] [256x256] [256x256] [256x256]  (각각 다운로드 + 확대 버튼)

--- AI 추천 상세컷 (있을 경우) ---
[256x256] [256x256] ...

[새로 만들기] [ZIP 다운로드]
```

### 이미지 카드 공통 스타일
- `w-64 h-64` (256px x 256px) 고정
- `rounded-xl border border-border bg-card overflow-hidden`
- hover 시 우측 상단에 다운로드 + 확대 버튼 표시
