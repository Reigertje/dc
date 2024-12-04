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

const selectConspirator = (players, activePlayer, lastConspirator) => {
  
    const otherPlayers = players.filter(player => player !== activePlayer);

    const withoutConspirator = otherPlayers.filter(player => player !== lastConspirator);

    // Create a list with all players listed twice, but the last conspirator only once
    // To create a slight bias against the last conspirator to be selected again
    const selectionList = [...otherPlayers, ...withoutConspirator];

    if (selectionList.length === 0) return null;

    const selection = selectionList[Math.floor(Math.random()*selectionList.length)];
    return selection;
}

export const broadcastMessage = (secretMessage, players, activePlayer, lastConspirator) => {

    const playerIds = players.map(player => player.id);

    const conspirator = selectConspirator(playerIds, activePlayer, lastConspirator);

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