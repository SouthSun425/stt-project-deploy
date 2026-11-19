import { useState } from "react";
import { login, saveAuth } from "../api/auth";
import { Icon } from "../components/Icons";

function LoginPage({ onLoginSuccess, goToSignup }) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState("");
  const handleLogin=async(e)=>{e.preventDefault();setMessage("");try{const data=await login(email,password);saveAuth(data);onLoginSuccess(data.user)}catch(error){setMessage(error.message)}};
  return <div className="auth-layout"><section className="auth-hero"><div className="auth-brand"><span className="brand-mark"><Icon name="wave" size={24}/></span>VoiceFlow <b>AI</b></div><div className="hero-copy"><span className="eyebrow"><Icon name="spark" size={16}/>AI MEETING INTELLIGENCE</span><h1>대화는 자연스럽게,<br/><em>기록은 정확하게.</em></h1><p>음성을 업로드하면 텍스트 변환부터 핵심 요약과 키워드 추출까지 한 번에 완성합니다.</p></div><div className="wave-visual">{Array.from({length:11}).map((_,i)=><span key={i}/>)}</div><p className="hero-foot">Secure workspace · Korean STT · AI summary</p></section><main className="auth-panel"><div className="auth-card"><div className="mobile-brand"><span className="brand-mark"><Icon name="wave"/></span>VoiceFlow AI</div><span className="eyebrow neutral">WELCOME BACK</span><h2>다시 만나서 반가워요</h2><p className="auth-desc">계정에 로그인하고 음성 기록을 이어가세요.</p><form className="auth-form" onSubmit={handleLogin}><label>이메일<input type="email" placeholder="name@company.com" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>비밀번호<input type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="primary-button" type="submit">로그인</button></form>{message&&<div className="form-message error">{message}</div>}<div className="auth-divider"><span>처음이신가요?</span></div><button className="secondary-button" onClick={goToSignup}>새 계정 만들기</button></div></main></div>;
}
export default LoginPage;
