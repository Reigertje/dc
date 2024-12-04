import { getDatabase, ref, set, onDisconnect, remove } from "firebase/database";

export const joinGame = (playerId, username) => {
    const db = getDatabase();
    const playerRef = ref(db, `players/${playerId}`);
        
    set(playerRef, {
        id: playerId,
        username: username
    })
    onDisconnect(playerRef).remove();
}


 const selectConspirator = (players, activePlayer) => {
  
    const otherPlayers = players.filter(player => player !== activePlayer);

    if (otherPlayers.length === 0) return null;

    return otherPlayers[Math.floor(Math.random()*otherPlayers.length)]
}

export const broadcastMessage = (secretMessage, players, activePlayer) => {

    const playerIds = players.map(player => player.id);

    const conspirator = selectConspirator(playerIds, activePlayer);

    if (!conspirator) return;
    
    const db = getDatabase();
    const messageDataRef = ref(db, `message_data`);

    set(messageDataRef, {
        secret_message: secretMessage,
        meta: { 
            conspirator_uid: conspirator,
            broadcaster_uid: activePlayer,
            recipients_uids: playerIds.join(',')
        }
    });
}

export const clearMessage = () => {
    const db = getDatabase();
    const messageDataRef = ref(db, `message_data`);

    remove(messageDataRef);   
}