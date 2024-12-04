import { useState, useEffect } from 'react';

const useUsername = () => {
    const [username, setUsername] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const updateUsername = (newUsername) => {
        setUsername(newUsername);
        localStorage.setItem('username', newUsername);
    }

    return { username, updateUsername }
}

export default useUsername;