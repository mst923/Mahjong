import React, { useState, useEffect } from 'react';
import './Play3.css';  // 新しいCSSファイルをインポート

const Play3 = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Array(3).fill(''));//ユーザの配列
  const [scores, setScores] = useState(new Array(3).fill(35000)); // 初期点数を設定
  const [kyoutaku, setKyoutaku] = useState(0); // 供託点数
  const [honba, setHonba] = useState(0); // 本場点数
  const [riichiStates, setRiichiStates] = useState(new Array(3).fill(false)); // リーチ状態
  const [tenpaiStates, setTenpaiStates] = useState(new Array(3).fill(false)); // 聴牌状態
  const [winds, setWinds] = useState(['東', '南', '西']); // 風牌
  const [showModal, setShowModal] = useState(false); // モーダルの表示状態
  const [agariType, setAgariType] = useState('ツモ'); // 和了タイプ
  const [agariUser, setAgariUser] = useState(0); // 和了ユーザー
  const [ronUser, setRonUser] = useState(0); // ロンされたユーザー
  const [childTsumoPoints, setChildTsumoPoints] = useState([]); // 子のツモの点数データ
  const [childRonPoints, setChildRonPoints] = useState([]); // 子のロンの点数データ
  const [parentTsumoPoints, setParentTsumoPoints] = useState([]); // 親のツモの点数データ
  const [parentRonPoints, setParentRonPoints] = useState([]); // 親のロンの点数データ
  const [selectedPoint, setSelectedPoint] = useState(null); // 選択された点数
  const [isTenpaiModal, setIsTenpaiModal] = useState(false); // 聴牌モーダルの表示状態

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => setUsers(data));

    fetch('/api/child_tsumo_scores')
    .then(response => response.json())
    .then(data => setChildTsumoPoints(data.points));

    fetch('/api/child_ron_scores')
    .then(response => response.json())
    .then(data => setChildRonPoints(data.points));

    fetch('/api/parent_tsumo_scores')
    .then(response => response.json())
    .then(data => setParentTsumoPoints(data.points));

    fetch('/api/parent_ron_scores')
    .then(response => response.json())
    .then(data => setParentRonPoints(data.points));
  }, []);

  //ユーザセレクトの時のハンドラ
  const handleSelectChange = (index, event) => {
    const newSelectedUsers = [...selectedUsers];
    newSelectedUsers[index] = event.target.value;
    setSelectedUsers(newSelectedUsers);
  };
  //立直ボタンが押された時のハンドラ
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

  //　流局の扱い
  const handleParentChange = () => {
    const newWinds = [...winds];
    newWinds.unshift(newWinds.pop()); // 風牌を反時計回りに移動
    setWinds(newWinds);

    // リーチ状態の解除
    const newRiichiStates = [...riichiStates];
    for (let i = 0; i < newRiichiStates.length; i++) {
      newRiichiStates[i] = false;
    }
    setRiichiStates(newRiichiStates);
  };

  //和了時にモーダルを表示
  const handleAgari = () => {
    setShowModal(true);
  };

  //モーダルの内容を計算する
  const handleModalSubmit = () => {
    const newScores = [...scores];

    if (agariType === 'ロン') {
      const ronPoint = selectedPoint; // ロンは単一値
      newScores[agariUser] += (ronPoint + 200 * honba);
      newScores[ronUser] -= (ronPoint + 200 * honba);
    } else if (agariType === 'ツモ') {
      //親のツモ
      if (winds[agariUser] === '東') {
        newScores[agariUser] += (selectedPoint * 2 + 200 * honba);
        for (let i = 0; i < newScores.length; i++) {
          if (i !== agariUser) {
            newScores[i] -= (selectedPoint + 100*honba);
          }
        }
      } else {
        //子のツモ
        const [nonEastPoint, eastPoint] = selectedPoint;
        newScores[agariUser] += (nonEastPoint + eastPoint + 200 * honba);
        for (let i = 0; i < newScores.length; i++) {
          if (i !== agariUser) {
            if(winds[i] === "東"){
              newScores[i] -= (eastPoint + 100*honba);
            }else {
              newScores[i] -= (nonEastPoint + 100*honba);
            }
          }
        }
      }
    }
    //和了が親でなければ、親を回す、本場を0にする
    if(winds[agariUser] !== '東'){
      handleParentChange()
      setHonba(0)
    }else{
      //和了が親であれば
      incrementHonba()
    }

    // 供託点数の受け取り
    newScores[agariUser] += kyoutaku;
    setKyoutaku(0);

    // リーチ状態の解除
    setRiichiStates(new Array(3).fill(false));

    setScores(newScores);
    //モーダルを閉じる
    setShowModal(false);
  };
  //点数のセレクタ
  const handlePointSelect = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions);
    const selectedValues = selectedOptions.map(option => JSON.parse(option.value));
    setSelectedPoint(selectedValues.length > 0 ? selectedValues[0] : [0, 0]);
  };

  //モーダルを閉じる&初期化
  const handleCloseModal = () => {
    setIsTenpaiModal(false)
    setShowModal(false);
    setAgariType('ツモ');
    setAgariUser(0);
    setRonUser(0);
    setSelectedPoint([0, 0]);
  };

  //和了方によって点数セットを変える
  const getPointsOptions = () => {
    if (agariType === 'ロン') {
      return winds[agariUser] === '東' ? parentRonPoints : childRonPoints;
    } else {
      return winds[agariUser] === '東' ? parentTsumoPoints : childTsumoPoints;
    }
  };
  //本場を+1する
  const incrementHonba = () => {
    setHonba(honba + 1);
  };
  //本場を-1する
  const decrementHonba = () => {
    if (honba > 0) {
      setHonba(honba - 1);
    }
  };
  
  const handleTenpai = () => {
    setIsTenpaiModal(true);
    setShowModal(true);
  };

  const handleTenpaiSubmit = () => {
    const newScores = [...scores];
    const newRiichiStates = [...riichiStates];
    const tenpaiCount = tenpaiStates.filter(state => state).length;

    if (tenpaiCount === 1) {
      const tenpaiIndex = tenpaiStates.indexOf(true);
      newScores[tenpaiIndex] += 2000; // 一人聴牌は2000点
      for (let i = 0; i < newScores.length; i++) {
        if (!tenpaiStates[i]) {
          newScores[i] -= 1000; //ノーてんは1000点ずつ払う
        }
      }
    } else if (tenpaiCount === 2) {
      for (let i = 0; i < newScores.length; i++) {
        if (tenpaiStates[i]) {
          newScores[i] += 1000; //二人聴牌は1000点ずつ
        } else {
          newScores[i] -= 2000; // ノーテンは2000点
        }
      }
    }

    // 全員のリーチ状態を解除
    for (let i = 0; i < newRiichiStates.length; i++) {
      newRiichiStates[i] = false;
    }

    const parentIndex = winds.indexOf('東')
    // 東が聴牌でない場合、親流れを呼び出す
    if (!tenpaiStates[parentIndex]) {
      handleParentChange();
    }

    setScores(newScores);
    setRiichiStates(newRiichiStates);
    setShowModal(false);
    setIsTenpaiModal(false);
    incrementHonba()
  };

  const handleTenpaiChange = (index) => {
    const newTenpaiStates = [...tenpaiStates];
    newTenpaiStates[index] = !newTenpaiStates[index];
    setTenpaiStates(newTenpaiStates);
  };

  const handleKyoutakuCollect = (index) => {
    if (window.confirm('供託点数を回収しますか？')) {
      const newScores = [...scores];
      newScores[index] += kyoutaku;
      setScores(newScores);
      setKyoutaku(0);
    }
  };

  return (
    <div className="play3-container">
      <h1>3人麻雀</h1>
      <div className="button-container">
      <button onClick={handleParentChange}>親流れ</button>
      <button onClick={handleAgari}>和了</button>
      <button onClick={handleTenpai}>聴牌</button>
      </div>
      
      <div className="kyoutaku-container">
        供託: {kyoutaku} 点
      </div>
      <div className="count-container">
        <button className="decrement" onClick={decrementHonba} disabled={honba === 0}>-</button>
        <span className="counter">{honba}本場</span>
        <button className="increment" onClick={incrementHonba}>+</button>
      </div>
      <div className="play3-table">
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
            <button
              className="kyoutaku-button"
              onClick={() => handleKyoutakuCollect(0)}
              disabled={kyoutaku === 0}
            >
              供託回収
            </button>
          </div>
        </div>
        <div className="user2">
        <span className="wind">{winds[1]}</span>
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
            <button
              className="kyoutaku-button"
              onClick={() => handleKyoutakuCollect(1)}
              disabled={kyoutaku === 0}
            >
              供託回収
            </button>
          </div>
        </div>
        <div className="user3">
        <span className="wind">{winds[2]}</span>
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
            <button
              className="kyoutaku-button"
              onClick={() => handleKyoutakuCollect(2)}
              disabled={kyoutaku === 0}
            >
              供託回収
            </button>
          </div>
        </div>
        
        <div className="table">
          {/* <img src="mahjong-table.jpeg" alt="" /> */}
        </div>
      </div>
      {showModal && (
        <div className="modal">
          <button className="close-button" onClick={handleCloseModal}>×</button>
          <h2>和了情報を入力してください</h2>
          <label>
            和了したユーザ:
            <select value={agariUser} onChange={(e) => setAgariUser(parseInt(e.target.value))}>
              {selectedUsers.map((user, index) => (
                <option key={index} value={index}>
                  {user}
                </option>
              ))}
            </select>
          </label>
          <label>
            タイプ:
            <select value={agariType} onChange={(e) => setAgariType(e.target.value)}>
              <option value="ツモ">ツモ</option>
              <option value="ロン">ロン</option>
            </select>
          </label>
          {agariType === 'ロン' && (
            <label>
              ロンされたユーザ:
              <select value={ronUser} onChange={(e) => setRonUser(parseInt(e.target.value))}>
                {selectedUsers.map((user, index) => (
                  <option key={index} value={index}>
                    {user}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
          点数:
          <select multiple onChange={handlePointSelect}>
          {getPointsOptions().map((point, index) => (
                <option key={index} value={JSON.stringify(point)}>
                  {Array.isArray(point) ? `${point[0]} / ${point[1]}` : point}
                </option>
              ))}
            </select>
          </label>

          <button onClick={handleModalSubmit}>確定</button>
        </div>
      )}
      {isTenpaiModal && (
        <div className="modal">
          <button className="close-button" onClick={handleCloseModal}>×</button>
          <h2>聴牌情報を入力してください</h2>
          {selectedUsers.map((user, index) => (
            <label key={index}>
              <input
                type="checkbox"
                checked={tenpaiStates[index]}
                onChange={() => handleTenpaiChange(index)}
              />
              {user}
            </label>
          ))}
          <button onClick={handleTenpaiSubmit}>確定</button>
        </div>
      )}
    </div>
  );
};

export default Play3;
