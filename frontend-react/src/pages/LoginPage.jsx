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
    <div className="page-container">
      <div className="card">
        <h1>로그인</h1>

        <form onSubmit={handleLogin} className="form">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">로그인</button>
        </form>

        {message && <p className="message">{message}</p>}

        <button className="link-button" onClick={goToSignup}>
          회원가입 하러가기
        </button>
      </div>
    </div>
  );
}

export default LoginPage;