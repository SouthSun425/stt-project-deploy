import { useEffect, useState } from "react";
import {
  fetchUsers,
  fetchUsageList,
  enableUser,
  disableUser,
  updateDailyLimit,
  unlockUser,
} from "../api/admin";
import Header from "../components/Header";

function AdminPage({ user, onLogout, goToUpload, goToAdmin }) {
  const [users, setUsers] = useState([]);
  const [usageList, setUsageList] = useState([]);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [limitInputs, setLimitInputs] = useState({});

  const loadAll = async (searchKeyword = "") => {
    try {
      const usersData = await fetchUsers(searchKeyword);
      const usageData = await fetchUsageList(searchKeyword);

      setUsers(usersData);
      setUsageList(usageData);

      const nextInputs = {};
      usersData.forEach((userItem) => {
        nextInputs[userItem.email] = userItem.dailyLimit;
      });
      setLimitInputs(nextInputs);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage("");
    await loadAll(keyword);
  };

  const handleEnable = async (email) => {
    try {
      await enableUser(email);
      setMessage("승인 완료");
      loadAll(keyword);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDisable = async (email) => {
    try {
      await disableUser(email);
      setMessage("차단 완료");
      loadAll(keyword);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleUnlock = async (email) => {
    try {
      await unlockUser(email);
      setMessage("잠금 해제 완료");
      loadAll(keyword);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLimitChange = (email, value) => {
    setLimitInputs((prev) => ({
      ...prev,
      [email]: value,
    }));
  };

  const handleUpdateLimit = async (email) => {
    try {
      const dailyLimit = Number(limitInputs[email]);
      await updateDailyLimit(email, dailyLimit);
      setMessage("일일 한도 수정 완료");
      loadAll(keyword);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="app-shell">
      <Header
        user={user}
        onLogout={onLogout}
        goToUpload={goToUpload}
        goToAdmin={goToAdmin}
      />

      <main className="app-content">
        <div className="card admin-card">
          <h1>관리자 페이지</h1>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="이메일 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit">검색</button>
          </form>

          {message && <p className="message">{message}</p>}

          <h2>사용자 관리</h2>
          <div className="user-list">
            {users.map((userItem) => (
              <div key={userItem.id} className="user-row">
                <div>
                  <strong>{userItem.email}</strong>
                  <p>관리자: {userItem.admin ? "예" : "아니오"}</p>
                  <p>STT 사용 가능: {userItem.canUseStt ? "예" : "아니오"}</p>
                  <p>활성화: {userItem.active ? "예" : "아니오"}</p>
                  <p>현재 일일 한도: {userItem.dailyLimit}</p>
                  <p>잠금 상태: {userItem.accountLocked ? "잠김" : "정상"}</p>
                  <p>잠금 해제 예정: {userItem.lockUntil || "-"}</p>
                </div>

                <div className="admin-actions">
                  <div className="button-group">
                    <button onClick={() => handleEnable(userItem.email)} type="button">승인</button>
                    <button onClick={() => handleDisable(userItem.email)} type="button">차단</button>
                    <button onClick={() => handleUnlock(userItem.email)} type="button">잠금 해제</button>
                  </div>

                  <div className="limit-form">
                    <input
                      type="number"
                      min="1"
                      value={limitInputs[userItem.email] ?? userItem.dailyLimit}
                      onChange={(e) => handleLimitChange(userItem.email, e.target.value)}
                    />
                    <button type="button" onClick={() => handleUpdateLimit(userItem.email)}>
                      한도 수정
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "32px" }}>오늘 사용량 목록</h2>
          <div className="user-list">
            {usageList.map((usageItem) => (
              <div key={usageItem.email} className="user-row">
                <div>
                  <strong>{usageItem.email}</strong>
                  <p>오늘 사용 횟수: {usageItem.todayUsedCount}</p>
                  <p>일일 총 한도: {usageItem.dailyLimit}</p>
                  <p>남은 사용 가능 횟수: {usageItem.remainingCount}</p>
                  <p>STT 사용 가능: {usageItem.canUseStt ? "예" : "아니오"}</p>
                  <p>무제한 여부: {usageItem.unlimited ? "예" : "아니오"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;