function Header({ user, onLogout, goToUpload, goToAdmin }) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <h1 className="app-logo">STT Service</h1>
      </div>

      <div className="app-header-center">
        <button className="nav-button" onClick={goToUpload}>
          업로드
        </button>

        {user?.isAdmin && (
          <button className="nav-button" onClick={goToAdmin}>
            관리자
          </button>
        )}
      </div>

      <div className="app-header-right">
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
          <span className="user-role">
            {user?.isAdmin ? "관리자" : "일반 사용자"}
          </span>
        </div>
        <button className="logout-button" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;