import React, { useState, useEffect } from 'react';
import './Play4.css';  // 新しいCSSファイルをインポート

const Play4 = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Array(4).fill(''));//ユーザの配列
  const [scores, setScores] = useState(new Array(4).fill(25000)); // 初期点数を設定
  const [kyoutaku, setKyoutaku] = useState(0); // 供託点数
  const [honba, setHonba] = useState(0); // 本場点数
  const [riichiStates, setRiichiStates] = useState(new Array(4).fill(false)); // リーチ状態
  const [tenpaiStates, setTenpaiStates] = useState(new Array(4).fill(false)); // 聴牌状態
  const [winds, setWinds] = useState(['東', '南', '西', '北']); // 風牌
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
  const [roundCount, setRoundCount] = useState(0); //局数

  // 各ユーザの記録データを管理する状態
  const [userStats, setUserStats] = useState([]);
  

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data)
        //ユーザデータの取得
        fetch('/api/statistics4')
        .then(responce => responce.json())
        .then(stats => {
          const initialStats = data.map(user => {
            const userStat = stats.find(stat => stat.userId === user.id);
            return userStat ? userStat : {
              userId: user.id,
              totalMatches: 0,
              totalRounds: 0,
              agariCount: 0,
              riichiCount: 0,
              riichiAgariCount: 0,
              totalAgariPoints: 0,
              totalHojuCount: 0,
              totalHojuPoints: 0,
              tsumoAgariCount: 0,
              topCount: 0,
              secondCount: 0,
              thirdCount: 0,
              lastCount: 0,
              hakoshitaCount: 0,
              totalPoints: 0,
        };
      });
      setUserStats(initialStats)
    })
    .catch(error => console.log('Error fetching statistics:', error));
  })
  .catch(error => console.log('Error fetching users:', error))

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

      //立直操作を取り消して、同時に立直回数も減らす
      const newUserStats = [...userStats];
      newUserStats[index].riichiCount -= 1;
      setUserStats(newUserStats);
    } else {
      // リーチしていない場合
      if (newScores[index] >= 1000) {
        newScores[index] -= 1000;
        newKyoutaku += 1000;
        newRiichiStates[index] = true;

        // リーチ回数を記録
        const newUserStats = [...userStats];
        newUserStats[index].riichiCount += 1;
        setUserStats(newUserStats);
      }
    }

    setScores(newScores);
    setKyoutaku(newKyoutaku);
    setRiichiStates(newRiichiStates);
  };

  //　誤操作してしまった時などの親を変える用のボタン。
  // 基本親を交代するだけであとは何もしない
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
  //平均打点や平均放銃を計算するときは、基本的に素点のみカウント
  const handleModalSubmit = () => {
    const newScores = [...scores];
    const newUserStats = [...userStats];

    //和了したユーザのカウントを1増やす
    newUserStats[agariUser].agariCount += 1;
    //和了したユーザが立直していた場合、立直和了カウントを1増やす
    if (riichiStates[agariUser]){
      newUserStats[agariUser].riichiAgariCount += 1;
    }

    if (agariType === 'ロン') {
      const ronPoint = selectedPoint; // ロンは単一値
      newScores[agariUser] += (ronPoint + 300 * honba);
      newScores[ronUser] -= (ronPoint + 300 * honba);

      //ロンしたユーザの記録を更新
      newUserStats[agariUser].totalAgariPoints += ronPoint

      // 放銃したユーザの記録を更新
      newUserStats[ronUser].totalHojuCount += 1;
      newUserStats[ronUser].totalHojuPoints += ronPoint;
    } else if (agariType === 'ツモ') {

      //ツモ和了の記録を更新
      newUserStats[agariUser].tsumoAgariCount += 1

      //親のツモ
      if (winds[agariUser] === '東') {
        newScores[agariUser] += (selectedPoint * 3 + 300 * honba);
        for (let i = 0; i < newScores.length; i++) {
          if (i !== agariUser) {
            newScores[i] -= (selectedPoint + 100*honba);
          }
        }
        //和了したユーザの記録を更新
        newUserStats[agariUser].totalAgariPoints += 3 * selectedPoint
      } else {
        //子のツモ
        const [nonEastPoint, eastPoint] = selectedPoint;
        newScores[agariUser] += (nonEastPoint * 2 + eastPoint + 300 * honba);
        for (let i = 0; i < newScores.length; i++) {
          if (i !== agariUser) {
            if(winds[i] === "東"){
              newScores[i] -= (eastPoint + 100*honba);
            }else {
              newScores[i] -= (nonEastPoint + 100*honba);
            }
          }
        }
        //和了したユーザの記録を更新
        newUserStats[agariUser].totalAgariPoints += nonEastPoint * 2 + eastPoint
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
    setRiichiStates(new Array(4).fill(false));

    setScores(newScores);
    //モーダルを閉じる
    setShowModal(false);
    //局数を1増やす
    setRoundCount(roundCount + 1);
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

  //立直してるプレーヤーのリーチカウントを繰り上げ
  const handleTenpaiSubmit = () => {
    const newScores = [...scores];
    const newRiichiStates = [...riichiStates];
    const tenpaiCount = tenpaiStates.filter(state => state).length;

    if (tenpaiCount === 1) {
      const tenpaiIndex = tenpaiStates.indexOf(true);
      newScores[tenpaiIndex] += 3000; // 1000点×3
      for (let i = 0; i < newScores.length; i++) {
        if (!tenpaiStates[i]) {
          newScores[i] -= 1000;
        }
      }
    } else if (tenpaiCount === 2) {
      for (let i = 0; i < newScores.length; i++) {
        if (tenpaiStates[i]) {
          newScores[i] += 1500;
        } else {
          newScores[i] -= 1500; // 1500点×2
        }
      }
    } else if (tenpaiCount === 3) {
      const nonTenpaiIndex = tenpaiStates.indexOf(false);
      newScores[nonTenpaiIndex] -= 3000; // 1000点×3
      for (let i = 0; i < newScores.length; i++) {
        if (tenpaiStates[i]) {
          newScores[i] += 3000;
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
    setRoundCount(roundCount + 1); //局数が増える
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

  //ゲーム終了時に呼び出される
  const handleEndGame = () => {
    if (window.confirm('ゲームを終了しますか？')) {

      
      // 局数の更新と試合数の更新
      const updatedStats = userStats.map(stat => ({
        ...stat,
        totalRounds: stat.totalRounds + roundCount,
        totalMatches: stat.totalMatches + 1,
      }));

      // ユーザのスコアを基に順位を決定
      //一旦固定でMリーグルール
      //30000点返し、10-30
      // ユーザのスコアを一時的に格納し、順位を決定
      const scoresWithIndex = scores.map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score);

      // 順位に応じた更新を実行
      scoresWithIndex.forEach((item, rank) => {
        const stat = updatedStats[item.index];
        if (rank === 0) {
          stat.topCount += 1;
          stat.totalPoints += (item.score - 30000) / 1000 + 50;
        } else if (rank === 1) {
          stat.secondCount += 1;
          stat.totalPoints += (item.score - 30000) / 1000 + 10;
        } else if (rank === 2) {
          stat.thirdCount += 1;
          stat.totalPoints += (item.score - 30000) / 1000 - 10;
        } else if (rank === 3) {
          stat.lastCount += 1;
          stat.totalPoints += (item.score - 30000) / 1000 - 30;
        }
      });

      // 各ユーザのポイント計算と表示
      console.log("ユーザ統計データ:", updatedStats);

      // サーバーに記録データを送信
      fetch('/api/statistics4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedStats)
      })
      .then(response => response.json())
      .then(data => {
        console.log('データベースに保存されました:', data);
      })
      .catch(error => {
        console.error('データベースへの保存中にエラーが発生しました:', error);
      });
    }
  };

  return (
    <div className="play4-container">
      <h1>4人麻雀</h1>
      <div className="button-container">
      <button onClick={handleParentChange}>親流れ</button>
      <button onClick={handleAgari}>和了</button>
      <button onClick={handleTenpai}>聴牌</button>
      <button onClick={handleEndGame}>終了</button>
      </div>
      
      <div className="kyoutaku-container">
        供託: {kyoutaku} 点
      </div>
      <div className="count-container">
        <button className="decrement" onClick={decrementHonba} disabled={honba === 0}>-</button>
        <span className="counter">{honba}本場</span>
        <button className="increment" onClick={incrementHonba}>+</button>
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
            <button
              className="kyoutaku-button"
              onClick={() => handleKyoutakuCollect(2)}
              disabled={kyoutaku === 0}
            >
              供託回収
            </button>
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
            <button
              className="kyoutaku-button"
              onClick={() => handleKyoutakuCollect(3)}
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
      {/* <button onClick={handleParentChange}>親流れ</button>
      <button onClick={handleAgari}>和了</button>
      <button onClick={handleTenpai}>聴牌</button> */}
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

export default Play4;
