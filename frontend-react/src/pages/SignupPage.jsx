import { useState } from "react";
import { signup } from "../api/auth";

function SignupPage({ goToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const validateForm = () => {
    if (!email.trim()) {
      setMessage("이메일을 입력해주세요.");
      return false;
    }

    if (!password.trim()) {
      setMessage("비밀번호를 입력해주세요.");
      return false;
    }

    if (password.length < 8) {
      setMessage("비밀번호는 8자리 이상이어야 합니다.");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      const data = await signup(email, password);
      setMessage(data.message || "회원가입 완료");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={titleStyle}>회원가입</h1>
          <p style={descStyle}>
            이 서비스는 음성 파일을 텍스트로 변환하는 STT 서비스입니다.
            회원가입 후 승인된 사용자만 STT 기능을 사용할 수 있습니다.
          </p>
          <div style={infoBoxStyle}>
            회원가입 후 관리자 승인 상태와 일일 사용 한도에 따라 기능 사용 여부가 결정됩니다.
          </div>
        </div>

        <form onSubmit={handleSignup} style={{ display: "grid", gap: "14px" }}>
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
              placeholder="비밀번호 8자리 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <div style={helperTextStyle}>비밀번호는 8자리 이상이어야 합니다.</div>
          </div>

          <button type="submit" style={primaryButtonStyle}>
            회원가입
          </button>
        </form>

        {message && <div style={messageStyle}>{message}</div>}

        <button type="button" onClick={goToLogin} style={linkButtonStyle}>
          로그인 하러가기
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

const helperTextStyle = {
  marginTop: "8px",
  fontSize: "12px",
  color: "#667085",
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

export default SignupPage;