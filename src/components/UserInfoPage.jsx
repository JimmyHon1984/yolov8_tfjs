import React, { useState } from "react";
import "../style/UserInfoPage.css";

const UserInfoPage = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name || "同學", classId);
  };

  return (
    <div className="user-info-container">
      <div className="user-info-left">
        <div className="login-illustration">
          <div className="avatar-icon">👩‍🎓</div>
          <div className="welcome-text">歡迎加入</div>
        </div>
      </div>
      <div className="user-info-right">
        <div className="user-info-card">
          <h1>請輸入你的資訊</h1>
          <p className="form-subtitle">這將幫助我們個性化你的體驗</p>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">你的名字</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：陳小明"
              />
            </div>
            <div className="input-group">
              <label htmlFor="classId">班級學號 (選填)</label>
              <input
                type="text"
                id="classId"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                placeholder="例如：六年級A班01號"
              />
            </div>
            <button type="submit" className="submit-button">
              開始探索
            </button>
          </form>
          <p className="form-note">* 你的資訊不會被永久保存或分享</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;