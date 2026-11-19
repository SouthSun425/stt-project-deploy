# STT Project

React, Spring Boot, FastAPI로 구성된 음성 변환 및 AI 요약 서비스입니다.

## 로컬 실행

1. `scripts/local-secrets.example.ps1`을 `scripts/local-secrets.ps1`로 복사합니다.
2. 복사한 파일의 예시 값을 로컬 전용 비밀값과 관리자 계정으로 교체합니다.
3. Windows에서 `STT_로컬실행.cmd`를 실행합니다.
4. 브라우저에서 `http://127.0.0.1:5173`을 엽니다.

`scripts/local-secrets.ps1`, `.env.local`, 로컬 DB, 로그, 가상환경은 Git에서 제외됩니다. OpenAI 기능을 사용하려면 Windows 환경변수 `OPENAI_API_KEY`가 필요합니다.

## 로컬 서비스

- React: `http://127.0.0.1:5173`
- Spring Boot: `http://127.0.0.1:8080`
- FastAPI: `http://127.0.0.1:8000`
