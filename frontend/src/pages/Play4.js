import React, { useState, useEffect } from 'react';
import './Play4.css';  // 新しいCSSファイルをインポート

const Play4 = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Array(4).fill(''));
  const [scores, setScores] = useState(new Array(4).fill(25000)); // 初期点数を設定
  const [kyoutaku, setKyoutaku] = useState(0); // 供託点数
  const [riichiStates, setRiichiStates] = useState(new Array(4).fill(false)); // リーチ状態
  const [winds, setWinds] = useState(['東', '南', '西', '北']); // 風牌

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data));
  }, []);

  const handleSelectChange = (index, event) => {
    const newSelectedUsers = [...selectedUsers];
    newSelectedUsers[index] = event.target.value;
    setSelectedUsers(newSelectedUsers);
  };

  const handleRiichiClick = (index) => {
    const newScores = [...scores];
    const newRiichiStates = [...riichiStates];
    let newKyoutaku = kyoutaku;

    if (newRiichiStates[index]) {
      // 既にリーチしている場合
      newScores[index] += 1000;
      newKyoutaku -= 1000;
      newRiichiStates[index] = false;
    } else {
      // リーチしていない場合
      if (newScores[index] >= 1000) {
        newScores[index] -= 1000;
        newKyoutaku += 1000;
        newRiichiStates[index] = true;
      }
    }

    setScores(newScores);
    setKyoutaku(newKyoutaku);
    setRiichiStates(newRiichiStates);
  };

  const handleParentChange = () => {
    const newWinds = [...winds];
    newWinds.unshift(newWinds.pop()); // 風牌を反時計回りに移動
    setWinds(newWinds);
  };


  return (
    <div className="play4-container">
      <h1>4人麻雀</h1>
      <div className="kyoutaku-container">
        供託: {kyoutaku} 点
      </div>
      <div className="play4-table">
        <div className="user1">
        <span className="wind">{winds[0]}</span>
          {/* <label>User 1:</label> */}
          <select value={selectedUsers[0]} onChange={(event) => handleSelectChange(0, event)}>
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.username}>{user.username}</option>
            ))}
          </select>
          <div className="controls">
            <button
              className={riichiStates[0] ? 'riichi' : 'normal'}
              onClick={() => handleRiichiClick(0)}
            >
              立直
            </button>
            <span>{scores[0]} 点</span>
          </div>
        </div>
        <div className="user2">
        <span className="wind">{winds[1]}</span>
          {/* <label>User 2:</label> */}
          <select value={selectedUsers[1]} onChange={(event) => handleSelectChange(1, event)}>
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.username}>{user.username}</option>
            ))}
          </select>
          <div className="controls">
            <button
              className={riichiStates[1] ? 'riichi' : 'normal'}
              onClick={() => handleRiichiClick(1)}
            >
              立直
            </button>
            <span>{scores[1]} 点</span>
          </div>
        </div>
        <div className="user3">
        
          {/* <label>User 3:</label> */}
          <select value={selectedUsers[2]} onChange={(event) => handleSelectChange(2, event)}>
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.username}>{user.username}</option>
            ))}
          </select>
          <div className="controls">
            <button
              className={riichiStates[2] ? 'riichi' : 'normal'}
              onClick={() => handleRiichiClick(2)}
            >
              立直
            </button>
            <span>{scores[2]} 点</span>
            <span className="wind">{winds[2]}</span>
          </div>
        </div>
        <div className="user4">
        <span className="wind">{winds[3]}</span>
          {/* <label>User 4:</label> */}
          <select value={selectedUsers[3]} onChange={(event) => handleSelectChange(3, event)}>
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.username}>{user.username}</option>
            ))}
          </select>
          <div className="controls">
            <button
              className={riichiStates[3] ? 'riichi' : 'normal'}
              onClick={() => handleRiichiClick(3)}
            >
              立直
            </button>
            <span>{scores[3]} 点</span>
          </div>
        </div>
        <div className="table">
          {/* <img src="mahjong-table.jpeg" alt="" /> */}
        </div>
      </div>
      <button onClick={handleParentChange}>親流れ</button>
      {/* <div>
        <h2>Selected Users</h2>
        <ul>
          {selectedUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div> */}
    </div>
  );
};

export default Play4;
