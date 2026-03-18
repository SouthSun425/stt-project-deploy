import { useState } from "react";
import { login, saveAuth } from "../api/auth";

function LoginPage({ onLoginSuccess, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await login(email, password);
      saveAuth(data);
      setMessage("로그인 성공");
      onLoginSuccess(data.user);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={titleStyle}>로그인</h1>
          <p style={descStyle}>
            이 서비스는 음성 파일을 업로드해 STT 변환을 수행하고,
            사용자별 사용량과 권한을 관리할 수 있는 STT 서비스입니다.
          </p>
          <div style={infoBoxStyle}>
            음성 파일 업로드, STT 변환, 사용량 조회, 관리자 승인 기능을 사용할 수 있습니다.
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: "14px" }}>
          <div>
            <label style={labelStyle}>이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" style={primaryButtonStyle}>
            로그인
          </button>
        </form>

        {message && <div style={messageStyle}>{message}</div>}

        <button type="button" onClick={goToSignup} style={linkButtonStyle}>
          회원가입 하러가기
        </button>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
};

const cardStyle = {
  width: "100%",
  maxWidth: "480px",
  backgroundColor: "#ffffff",
  border: "1px solid #eaecf0",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 10px 30px rgba(16, 24, 40, 0.08)",
};

const titleStyle = {
  margin: "0 0 10px",
  fontSize: "30px",
  fontWeight: 800,
  color: "#101828",
};

const descStyle = {
  margin: "0 0 12px",
  color: "#667085",
  fontSize: "15px",
  lineHeight: 1.6,
};

const infoBoxStyle = {
  padding: "12px 14px",
  borderRadius: "12px",
  backgroundColor: "#f8f9fc",
  border: "1px solid #d0d5dd",
  color: "#344054",
  fontSize: "14px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#344054",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d0d5dd",
  fontSize: "14px",
  outline: "none",
};

const primaryButtonStyle = {
  marginTop: "6px",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #111827",
  backgroundColor: "#111827",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const linkButtonStyle = {
  marginTop: "16px",
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #d0d5dd",
  backgroundColor: "#ffffff",
  color: "#344054",
  fontWeight: 600,
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "16px",
  padding: "12px 14px",
  borderRadius: "12px",
  backgroundColor: "#f8f9fc",
  border: "1px solid #d0d5dd",
  color: "#344054",
  fontWeight: 600,
};

export default LoginPage;