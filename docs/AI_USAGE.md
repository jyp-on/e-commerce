# AI 활용 기록 - 이커머스 경영 경리 프로그램 개발

## 개요

이 문서는 이커머스 경영 경리 프로그램 개발 과정에서 AI(LLM)를 활용한 경험과 의사결정 과정을 기록한 문서입니다.

## AI가 제안한 것과 다르게 결정한 부분

### 1. 기술 스택 선택

**AI 초기 제안**: Python + FastAPI 조합

**내가 변경한 것**: Node.js + Express + PostgreSQL 조합

**변경 이유**:
- JavaScript 생태계 통일성
- Node.js + Express를 실제로 많이 사용해본 경험
- JSON/CSV 처리에 최적화된 라이브러리 지원
- 비동기 처리로 대용량 파일 처리 성능 우수

### 2. 문서 구조

**AI 초기 제안**: 모든 내용을 README.md에 포함

**내가 변경한 것**: 목적별 문서 분리 (README.md, ARCHITECTURE.md, AI_USAGE.md)

**변경 이유**:
- 가독성과 유지보수성 향상
- 각 문서의 목적 명확화
- 사용자 편의성 증대

### 3. API 응답 형식

**AI 초기 제안**: 일반적인 REST API 응답 형식

**내가 변경한 것**: 실제 구현된 API 응답과 동일하게 수정

**변경 이유**:
- 문서의 정확성과 실용성 확보
- 사용자가 실제 API 테스트 시 혼란 방지

## 결과물이 마음에 들지 않아서 프롬프트를 바꾼 부분

### 1. 문서 가독성 개선

**초기 프롬프트**: "문서를 작성해주세요"

**변경된 프롬프트**: "가독성을 고려한 마크다운 포맷팅으로 문서를 작성해주세요"

**변경 이유**: 
- AI가 생성한 문서의 마크다운 포맷팅이 부족함 (줄바꿈 누락, 불릿 포인트 오류)
- 문서의 가독성이 실제 사용성에 직접적 영향

### 2. 보안 설명 방식

**초기 프롬프트**: "보안 코드를 구현해주세요"

**변경된 프롬프트**: "보안 개념과 아키텍처를 설명해주세요"

**변경 이유**:
- 코드보다는 보안 개념과 아키텍처 설명이 더 유용함
- 문서 목적에 맞는 접근 방식 필요

## 이론적으로 이상적이나 실제로 한번도 경험해보지 않은 부분

### 1. 머신러닝 기반 자동 분류
- **이론**: AI/ML을 활용한 거래 내역 자동 분류
- **실제**: 규칙 기반 분류만 구현
- **이유**: 프로토타입 단계에서는 규칙 기반이 충분하고, ML 구현 경험 부족

### 2. 고급 보안 기능
- **이론**: AWS KMS, Row Level Security, MFA 등
- **실제**: 기본적인 보안 미들웨어만 구현
- **이유**: 개발 환경에서는 기본 보안으로 충분하고, 고급 보안 기능 구현 경험 부족

## 실제 경험에서 얻은 교훈

### 1. 실용적 접근의 중요성
- 이론적 완벽함보다 실용적 적합성이 중요
- 단계적 접근이 효율적
- 실제 운영 환경을 고려한 설계 필요

### 2. 반복적 개선의 필요성
- 초기 결과물 검토 후 피드백 반영
- 프롬프트 엔지니어링의 중요성
- 지속적인 개선 과정

## 결론

AI는 강력한 도구이지만, 그 효과는 사용자의 전문성과 판단력에 달려있습니다. 이번 프로젝트를 통해 AI를 활용할 때는 구체적인 요구사항 정의, 실용적 판단, 그리고 반복적 개선이 중요하다는 것을 배웠습니다. 