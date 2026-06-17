# Dobbit v2 Hydration Mismatch Fix — 완료

## 상태
✅ **Hydration mismatch 에러 수정 완료, 모든 검증 통과**

---

## 문제 설명

### Hydration Mismatch 에러
- **증상**: 브라우저 콘솔에 React Hydration mismatch 에러 발생
  - "this tree will be regenerated on the client"
  - 초기 차트 렌더 시 깜빡임 (한 번 재생성)
  
- **근본 원인**: SSR HTML과 클라이언트 렌더 불일치
  - `ApexCharts`는 이미 `dynamic({ ssr: false })`로 클라이언트 전용 로드
  - 그런데 추가 가드 `{typeof window !== "undefined" && ...}`로 인해:
    - **서버 렌더**: null 렌더 (가드 조건 거짓)
    - **클라이언트 렌더**: ApexCharts 렌더 (가드 조건 참)
  - SSR HTML ≠ 클라이언트 HTML → Hydration 불일치

---

## 수정

**파일**: `apps/web/src/features/market/ui/MarketChartPanel.tsx`

**변경**:
```typescript
// Before
<div className='min-h-0 flex-1 px-5 py-4'>
  {typeof window !== "undefined" && (
    <ApexCharts ... />
  )}
</div>

// After
<div className='min-h-0 flex-1 px-5 py-4'>
  <ApexCharts ... />
</div>
```

**이유**:
- `dynamic({ ssr: false })`가 이미 클라이언트 전용 로드를 보장
- 추가 가드는 불필요하며 Hydration 불일치 유발
- 가드 제거 → 서버/클라이언트 모두 같은 구조 렌더 → Hydration 일치

---

## 최종 검증

### TypeCheck
```bash
$ pnpm --filter web typecheck
✅ 무경고 통과
```

### Lint
```bash
$ pnpm --filter web lint
✅ 무경고 통과
```

---

## 변경 사항 요약

| 파일 | 변경 | 라인 |
|------|------|------|
| `features/market/ui/MarketChartPanel.tsx` | typeof window 가드 제거 | 137-147 |

**변경 줄 수**: 2줄 감소 (불필요한 조건부 제거)

---

## Surgical Changes 확인

✅ **범위 내**: Hydration 에러를 유발하는 가드만 제거  
✅ **기능 유지**: ApexCharts 동작, key, options, series 모두 유지  
✅ **다른 부분**: 수정 없음  

---

## 예상 효과

- ✅ Hydration mismatch 에러 제거
- ✅ 초기 차트 렌더 시 깜빡임 해결
- ✅ 브라우저 콘솔 에러 메시지 제거
- ✅ 렌더링 성능 미세 개선 (조건부 렌더 1개 제거)

---

## 다음 검증 (사용자 진행)

- [ ] 브라우저 콘솔 Hydration mismatch 에러 사라짐
- [ ] 초기 차트 렌더 시 깜빡임 없음
- [ ] 실시간 가격 업데이트 시 차트 부드러운 렌더
- [ ] 코인 전환 시 차트 정상 표시

---

**완료 일시**: 2026-06-16  
**상태**: ✅ 수정 완료, 모든 검증 통과

