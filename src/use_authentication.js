
import { useEffect, useState } from "react";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const useAuthentication = () => {
    const [playerId, setPlayerId] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                setPlayerId(user.uid);
            } else {
                setPlayerId(null);
            }
        })

        signInAnonymously(auth).catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
        });
    }, [auth])

    return { authenticatedPlayerId: playerId };
}

export default useAuthentication;