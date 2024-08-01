import React, { useState, useEffect } from 'react';

const Statistics4 = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);
    fetch(`/api/statistics4/${userId}`)
      .then(response => response.json())
      .then(data => setStatistics(data))
      .catch(error => console.error('Error fetching statistics:', error));
  };

  return (
    <div>
      <h1>4人麻雀、半荘戦</h1>
      <select value={selectedUser} onChange={handleUserChange}>
        <option value="">ユーザを選択</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.username}</option>
        ))}
      </select>

      {statistics && (
        <div>
          <h2>{users.find(user => user.id === parseInt(selectedUser))?.username}の統計データ</h2>
          <p>対戦数: {statistics.totalMatches}回</p>
          <p>総局数: {statistics.totalRounds}回</p>
          <p>和了率: {statistics.agariRate}%</p>
          <p>平均和了点数: {statistics.averageAgariPoints}点</p>
          <p>ツモ和了率: {statistics.tsumoAgariRate}%</p>
          <p>立直率: {statistics.riichiRate}%</p>
          <p>立直和了率: {statistics.riichiAgariRate}%</p>
          <p>放銃率: {statistics.hojuRate}%</p>
          <p>平均放銃点数: {statistics.averageHojuPoints}点</p>
          <p>トップ率: {statistics.topRate}%</p>
          <p>2着率: {statistics.secondRate}%</p>
          <p>3着率: {statistics.thirdRate}%</p>
          <p>ラス率: {statistics.lastRate}%</p>
          <p>箱下率: {statistics.hakoshitaRate}%</p>
          {/* <p>平均順位: {statistics.averageRank}位</p> */}
          <p>総ポイント: {statistics.totalPoints}</p>
        </div>
      )}
    </div>
  );
};

export default Statistics4;
