import { useEffect, useMemo, useState } from "react";
import {
  fetchUsers,
  fetchUsageList,
  enableUser,
  disableUser,
  updateDailyLimit,
  unlockUser,
} from "../api/admin";
import Header from "../components/Header";

function StatusBadge({ text, type = "default" }) {
  const colorMap = {
    success: {
      backgroundColor: "#ecfdf3",
      color: "#027a48",
      border: "1px solid #a6f4c5",
    },
    danger: {
      backgroundColor: "#fef3f2",
      color: "#b42318",
      border: "1px solid #fecdca",
    },
    warning: {
      backgroundColor: "#fffaeb",
      color: "#b54708",
      border: "1px solid #fedf89",
    },
    default: {
      backgroundColor: "#f8f9fc",
      color: "#344054",
      border: "1px solid #d0d5dd",
    },
    admin: {
      backgroundColor: "#eef4ff",
      color: "#3538cd",
      border: "1px solid #c7d7fe",
    },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...colorMap[type],
      }}
    >
      {text}
    </span>
  );
}

function ActionButton({ children, onClick, variant = "default" }) {
  const styleMap = {
    default: {
      backgroundColor: "#ffffff",
      color: "#344054",
      border: "1px solid #d0d5dd",
    },
    primary: {
      backgroundColor: "#111827",
      color: "#ffffff",
      border: "1px solid #111827",
    },
    success: {
      backgroundColor: "#ecfdf3",
      color: "#027a48",
      border: "1px solid #a6f4c5",
    },
    danger: {
      backgroundColor: "#fef3f2",
      color: "#b42318",
      border: "1px solid #fecdca",
    },
    warning: {
      backgroundColor: "#fffaeb",
      color: "#b54708",
      border: "1px solid #fedf89",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
        ...styleMap[variant],
      }}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, right, children }) {
  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #eaecf0",
        borderRadius: "18px",
        padding: "20px",
        boxShadow: "0 4px 16px rgba(16, 24, 40, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            color: "#101828",
          }}
        >
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function EmptyBox({ text }) {
  return (
    <div
      style={{
        padding: "28px 16px",
        textAlign: "center",
        border: "1px dashed #d0d5dd",
        borderRadius: "14px",
        color: "#667085",
        backgroundColor: "#fcfcfd",
      }}
    >
      {text}
    </div>
  );
}

function AdminPage({ user, onLogout, goToUpload, goToAdmin }) {
  const [users, setUsers] = useState([]);
  const [usageList, setUsageList] = useState([]);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [limitInputs, setLimitInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const loadAll = async (searchKeyword = "") => {
    try {
      setLoading(true);
      setMessage("");

      const usersData = await fetchUsers(searchKeyword);
      const usageData = await fetchUsageList(searchKeyword);

      const safeUsers = Array.isArray(usersData) ? usersData : [];
      const safeUsageList = Array.isArray(usageData) ? usageData : [];

      setUsers(safeUsers);
      setUsageList(safeUsageList);

      const nextInputs = {};
      safeUsers.forEach((userItem) => {
        nextInputs[userItem.email] = userItem.dailyLimit ?? 0;
      });
      setLimitInputs(nextInputs);
    } catch (error) {
      console.error("AdminPage loadAll error:", error);
      setUsers([]);
      setUsageList([]);
      setMessage(error.message || "관리자 데이터 로딩 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const summary = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((item) => item.active).length;
    const sttEnabledUsers = users.filter((item) => item.canUseStt).length;
    const adminUsers = users.filter((item) => item.admin).length;

    return {
      totalUsers,
      activeUsers,
      sttEnabledUsers,
      adminUsers,
    };
  }, [users]);

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadAll(keyword);
  };

  const handleEnable = async (email) => {
    try {
      await enableUser(email);
      setMessage("승인 완료");
      await loadAll(keyword);
    } catch (error) {
      setMessage(error.message || "승인 중 오류가 발생했습니다.");
    }
  };

  const handleDisable = async (email) => {
    try {
      await disableUser(email);
      setMessage("차단 완료");
      await loadAll(keyword);
    } catch (error) {
      setMessage(error.message || "차단 중 오류가 발생했습니다.");
    }
  };

  const handleUnlock = async (email) => {
    try {
      await unlockUser(email);
      setMessage("잠금 해제 완료");
      await loadAll(keyword);
    } catch (error) {
      setMessage(error.message || "잠금 해제 중 오류가 발생했습니다.");
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
      await loadAll(keyword);
    } catch (error) {
      setMessage(error.message || "일일 한도 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
      }}
    >
      <Header
        user={user}
        onLogout={onLogout}
        goToUpload={goToUpload}
        goToAdmin={goToAdmin}
      />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "28px 20px 40px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "32px",
              fontWeight: 800,
              color: "#101828",
            }}
          >
            관리자 페이지
          </h1>
          <p
            style={{
              margin: 0,
              color: "#667085",
              fontSize: "15px",
            }}
          >
            사용자 승인, 사용량 조회, 일일 한도 관리, 계정 잠금 해제를 한 화면에서 처리할 수 있습니다.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid #d0d5dd",
              backgroundColor: "#ffffff",
              color: "#344054",
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "전체 사용자", value: summary.totalUsers },
            { label: "활성 사용자", value: summary.activeUsers },
            { label: "STT 가능 사용자", value: summary.sttEnabledUsers },
            { label: "관리자 계정", value: summary.adminUsers },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #eaecf0",
                borderRadius: "18px",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(16, 24, 40, 0.04)",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#667085",
                  marginBottom: "10px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#101828",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <SectionCard
          title="검색"
          right={
            <button
              type="button"
              onClick={() => loadAll(keyword)}
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                backgroundColor: "#111827",
                color: "#ffffff",
                border: "1px solid #111827",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              새로고침
            </button>
          }
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="이메일 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: "1 1 320px",
                minWidth: "240px",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid #d0d5dd",
                outline: "none",
                fontSize: "14px",
                backgroundColor: "#ffffff",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                backgroundColor: "#111827",
                color: "#ffffff",
                border: "1px solid #111827",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              검색
            </button>
          </form>
        </SectionCard>

        <div
          style={{
            display: "grid",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          <SectionCard
            title="사용자 관리"
            right={
              <span style={{ color: "#667085", fontSize: "14px" }}>
                {loading ? "불러오는 중..." : `${users.length}명`}
              </span>
            }
          >
            {users.length === 0 ? (
              <EmptyBox text="표시할 사용자가 없습니다." />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "1100px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eaecf0" }}>
                      <th style={thStyle}>이메일</th>
                      <th style={thStyle}>권한</th>
                      <th style={thStyle}>활성화</th>
                      <th style={thStyle}>STT 사용</th>
                      <th style={thStyle}>잠금 상태</th>
                      <th style={thStyle}>잠금 해제 예정</th>
                      <th style={thStyle}>일일 한도</th>
                      <th style={thStyle}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr
                        key={userItem.email}
                        style={{ borderBottom: "1px solid #f2f4f7" }}
                      >
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: "#101828" }}>
                            {userItem.email}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          {userItem.admin ? (
                            <StatusBadge text="관리자" type="admin" />
                          ) : (
                            <StatusBadge text="일반 사용자" />
                          )}
                        </td>
                        <td style={tdStyle}>
                          {userItem.active ? (
                            <StatusBadge text="활성" type="success" />
                          ) : (
                            <StatusBadge text="비활성" type="danger" />
                          )}
                        </td>
                        <td style={tdStyle}>
                          {userItem.canUseStt ? (
                            <StatusBadge text="가능" type="success" />
                          ) : (
                            <StatusBadge text="불가" type="warning" />
                          )}
                        </td>
                        <td style={tdStyle}>
                          {userItem.accountLocked ? (
                            <StatusBadge text="잠김" type="danger" />
                          ) : (
                            <StatusBadge text="정상" type="success" />
                          )}
                        </td>
                        <td style={tdStyle}>
                          {userItem.lockUntil || "-"}
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <input
                              type="number"
                              value={
                                limitInputs[userItem.email] ?? userItem.dailyLimit
                              }
                              onChange={(e) =>
                                handleLimitChange(userItem.email, e.target.value)
                              }
                              style={{
                                width: "90px",
                                padding: "8px 10px",
                                borderRadius: "10px",
                                border: "1px solid #d0d5dd",
                              }}
                            />
                            <ActionButton
                              variant="primary"
                              onClick={() => handleUpdateLimit(userItem.email)}
                            >
                              저장
                            </ActionButton>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <ActionButton
                              variant="success"
                              onClick={() => handleEnable(userItem.email)}
                            >
                              승인
                            </ActionButton>
                            <ActionButton
                              variant="danger"
                              onClick={() => handleDisable(userItem.email)}
                            >
                              차단
                            </ActionButton>
                            <ActionButton
                              variant="warning"
                              onClick={() => handleUnlock(userItem.email)}
                            >
                              잠금 해제
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="오늘 사용량 목록"
            right={
              <span style={{ color: "#667085", fontSize: "14px" }}>
                {loading ? "불러오는 중..." : `${usageList.length}건`}
              </span>
            }
          >
            {usageList.length === 0 ? (
              <EmptyBox text="표시할 사용량 데이터가 없습니다." />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "900px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eaecf0" }}>
                      <th style={thStyle}>이메일</th>
                      <th style={thStyle}>오늘 사용 횟수</th>
                      <th style={thStyle}>일일 한도</th>
                      <th style={thStyle}>남은 횟수</th>
                      <th style={thStyle}>STT 사용</th>
                      <th style={thStyle}>무제한</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageList.map((usageItem) => (
                      <tr
                        key={usageItem.email}
                        style={{ borderBottom: "1px solid #f2f4f7" }}
                      >
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: "#101828" }}>
                            {usageItem.email}
                          </div>
                        </td>
                        <td style={tdStyle}>{usageItem.todayUsedCount}</td>
                        <td style={tdStyle}>{usageItem.dailyLimit}</td>
                        <td style={tdStyle}>{usageItem.remainingCount}</td>
                        <td style={tdStyle}>
                          {usageItem.canUseStt ? (
                            <StatusBadge text="가능" type="success" />
                          ) : (
                            <StatusBadge text="불가" type="warning" />
                          )}
                        </td>
                        <td style={tdStyle}>
                          {usageItem.unlimited ? (
                            <StatusBadge text="무제한" type="admin" />
                          ) : (
                            <StatusBadge text="제한형" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "14px 12px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#475467",
  backgroundColor: "#f9fafb",
};

const tdStyle = {
  padding: "14px 12px",
  fontSize: "14px",
  color: "#344054",
  verticalAlign: "middle",
};

export default AdminPage;