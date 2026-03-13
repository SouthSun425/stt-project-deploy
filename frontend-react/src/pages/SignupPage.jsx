import { useState } from "react";
import { signup } from "../api/auth";

function SignupPage({ goToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

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
    <div className="page-container">
      <div className="card">
        <h1>회원가입</h1>
        <form onSubmit={handleSignup} className="form">
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
          <button type="submit">회원가입</button>
        </form>

        {message && <p className="message">{message}</p>}

        <button className="link-button" onClick={goToLogin}>
          로그인 하러가기
        </button>
      </div>
    </div>
  );
}

export default SignupPage;