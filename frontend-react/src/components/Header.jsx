import { Icon } from "./Icons";

function Header({ user, onLogout, goToUpload, goToAdmin }) {
  return <header className="topbar"><button className="brand" onClick={goToUpload} aria-label="업로드 홈"><span className="brand-mark"><Icon name="wave" size={22}/></span><span>VoiceFlow <b>AI</b></span></button><nav className="topnav" aria-label="주 메뉴"><button className="nav-link" onClick={goToUpload}><Icon name="upload" size={17}/>업로드</button>{user?.isAdmin&&<button className="nav-link" onClick={goToAdmin}><Icon name="users" size={17}/>관리자</button>}</nav><div className="account-area"><div className="avatar">{user?.email?.[0]?.toUpperCase()||"U"}</div><div className="account-copy"><strong>{user?.email}</strong><span>{user?.isAdmin?"Administrator":"Member"}</span></div><button className="icon-button" onClick={onLogout} title="로그아웃"><Icon name="logout" size={19}/></button></div></header>;
}
export default Header;
