import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";


const useGameData = () => {
    const [players, setPlayers] = useState(null);
    const [messageMeta, setMessageMeta] = useState(null);
    const [secretMessage, setSecretMessage] = useState(null);

    const db = getDatabase();

    useEffect(() => {
        const playerRef = ref(db, `players`);
        const metaRef = ref(db, `message_data/meta`);
        const messageRef = ref(db, `message_data/secret_message`);

        onValue(metaRef, snapshot => {
            setSecretMessage(null);
            const val = snapshot.val();

            if (val) {
                setMessageMeta({
                    recipients: val.recipients_uids.split(','),
                    conspirator: val.conspirator_uid,
                    broadcaster: val.broadcaster_uid,
                });
            } else {
                setMessageMeta(null);
            }

            onValue(messageRef, snapshot => {
                setSecretMessage(snapshot.val());
            })
        });

        onValue(playerRef, snapshot => {
            const val = snapshot.val();
            const playerList = []
            if (val) {
                Object.keys(val).forEach(key => {
                    if (val[key].username) {
                        playerList.push({ id: val[key].id, username: val[key].username })
                    }
                })
            }
            setPlayers(playerList);
        });
    }, [db])

    return {
        players, messageMeta, secretMessage, 
        loading: !(players)
    }
}

export default useGameData;