import './App.css';
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import GameView from './GameView';

const NewApp = () => {
  const [connected, setConnected] = useState(false);
  const db = getDatabase();

  useEffect(() => {
    onValue(ref(db, ".info/connected"), (snap) => {
      if (snap.val() === true) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    });
  }, [db])

  return <>
    <span style={{ fontSize: "10px", textAlign: "center"}}>{ connected ? "🟢 Connected " : "🔴 Not Connected" }</span>
    { connected && <GameView /> }
  </>

}

export default NewApp;
