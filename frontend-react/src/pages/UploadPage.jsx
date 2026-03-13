import { useEffect, useState } from "react";
import { uploadAudio } from "../api/stt";
import { apiFetch } from "../api/client";
import Header from "../components/Header";

function UploadPage({ user, onLogout, goToAdmin, goToUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [usage, setUsage] = useState(null);

  const loadUsage = async () => {
    try {
      const data = await apiFetch("/api/stt/usage", {
        method: "GET",
      });
      setUsage(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setResult(null);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!user?.canUseStt) {
      setMessage("현재 STT 사용 권한이 없습니다. 관리자 승인 후 이용 가능합니다.");
      return;
    }

    if (!selectedFile) {
      setMessage("음성 파일을 선택해주세요.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const data = await uploadAudio(selectedFile);
      setResult(data);
      setUsage({
        email: user.email,
        dailyLimit: data.dailyLimit,
        todayUsedCount: data.todayUsedCount,
        remainingCount: data.remainingCount,
        canUseStt: user.canUseStt,
        unlimited: user.isUnlimited,
      });
      setMessage("처리 완료");
    } catch (error) {
      const text = error.message || "";

      if (
        text.includes("오늘 사용 한도를 초과했습니다") ||
        text.includes("오늘 사용 한도") ||
        text.includes("remainingCount")
      ) {
        alert("오늘 사용 한도를 모두 사용했습니다.");
        setMessage("오늘 사용 한도를 모두 사용했습니다.");
      } else {
        setMessage(text);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setMessage(`${label} 복사 완료`);
    } catch (error) {
      setMessage(`${label} 복사 실패`);
    }
  };

  return (
    <div className="app-shell">
      <Header
        user={user}
        onLogout={onLogout}
        goToAdmin={goToAdmin}
        goToUpload={goToUpload}
      />

      <main className="app-content">
        <div className="card upload-card">
          <h1>음성 파일 업로드</h1>

          <div className="info-box">
            <p><strong>로그인 사용자:</strong> {user?.email}</p>
            <p><strong>STT 사용 가능:</strong> {user?.canUseStt ? "예" : "아니오"}</p>
            <p><strong>일일 총 한도:</strong> {usage?.dailyLimit ?? user?.dailyLimit}</p>
            <p><strong>오늘 사용 횟수:</strong> {usage?.todayUsedCount ?? 0}</p>
            <p><strong>남은 사용 가능 횟수:</strong> {usage?.remainingCount ?? (user?.dailyLimit ?? 0)}</p>
          </div>

          {!user?.canUseStt && (
            <div className="warning-box">
              관리자 승인 전까지 STT 사용이 불가합니다.
            </div>
          )}

          <input
            type="file"
            accept=".wav,.mp3,.m4a"
            onChange={handleFileChange}
            disabled={!user?.canUseStt}
          />

          <button onClick={handleUpload} disabled={loading || !user?.canUseStt}>
            {loading ? "처리 중..." : "업로드 및 변환"}
          </button>

          {message && <p className="message">{message}</p>}

          {result && (
            <div className="result-box">
              <h2>변환 결과</h2>
              <p><strong>파일명:</strong> {result.filename}</p>

              <div className="result-header">
                <h3>전체 텍스트</h3>
                <button onClick={() => copyText(result.text, "전체 텍스트")}>
                  전체 텍스트 복사
                </button>
              </div>
              <div className="result-text">{result.text}</div>

              <div className="result-header">
                <h3>요약</h3>
                <button onClick={() => copyText(result.summary, "요약문")}>
                  요약문 복사
                </button>
              </div>
              <div className="result-text">{result.summary}</div>

              <h3>키워드</h3>
              <div className="keyword-list">
                {result.keywords && result.keywords.length > 0 ? (
                  result.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-item">
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span>없음</span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UploadPage;