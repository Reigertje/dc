import './App.css';
import React, { useEffect, useState } from 'react';
import { Button, Container, Dialog, DialogContent, DialogTitle, TextField } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

import useAuthentication from './use_authentication';
import useGameData from './use_game_data';
import { joinGame, broadcastMessage, clearMessage } from './game_actions';

const MessageDialog = ({ open, handleClose, handleMessageBroadcast }) => {
  const [secretMessage, setSecretMessage] = useState("");

  const handleSubmit = (e) => {
    handleMessageBroadcast(secretMessage);
    setSecretMessage("");
    handleClose();
    e.preventDefault();
  }

  return <Dialog open={open} onClose={handleClose}>
    <DialogTitle>
      Broadcast secret message
    </DialogTitle>
    <DialogContent>
        <form onSubmit={handleSubmit}>
            <TextField fullWidth value={secretMessage} onChange={e => setSecretMessage(e.target.value)} />
            <div>
                <Button type="submit">Broadcast</Button>
            </div>
    </form>
    </DialogContent>
  </Dialog>
}

const SecretMessage = ({ secretMessage, messageMeta, player }) => {
    const [revealed, setRevealed] = useState(0);
    const { conspirator, recipients, broadcaster } = messageMeta;
    const isRecipient = recipients.includes(player);
    
    useEffect(() => {
        if (revealed > 0) {
            const timeout = setTimeout(() => { setRevealed(revealed - 0.1)}, 150)
            return () => clearTimeout(timeout);
        }
    }, [revealed])

    const title = player === broadcaster ? `Secret message sent to ${recipients.length - 1} people` : isRecipient ? "Secret message available:" : "No messages.";

    return <div>
        <h3>{title}</h3>
        { isRecipient && <>
            <Button color="error" onClick={() => setRevealed(1)} variant="contained" size="large" startIcon={<VisibilityIcon />}>Reveal</Button>
            {revealed > 0 && <>
                { player === conspirator ? 
                    <div style={{ opacity: revealed }}>
                        <h2 style={{ color: "red", marginBottom: "2px" }}>{"<MESSAGE REDACTED>"}</h2>
                        <h5 style={{ marginTop: "2px"}}>(you are the conspirator)</h5>
                    </div> 
                    : 
                    <h1 style={{ opacity: revealed }}>
                        "{secretMessage && secretMessage.trim()}"
                    </h1>
                }
            </>}
        </>}
    </div>
}

const GameView = ({ playerId }) => {
    const gameData = useGameData();
    const [showMessageDialog, setShowMessageDialog] = useState(false);
    const { loading, players, secretMessage, messageMeta } = gameData;

    useEffect(() => {
        joinGame(playerId);
    }, [playerId])

    const startNewBroadcast = () => {
        if (messageMeta) {
            if (window.confirm("Starting a new broadcast will erase the current message!")) {
                clearMessage();
            } else {
                return;
            }
        }
        setShowMessageDialog(true);
    }

    if (loading) return null;

    return <div style={{ marginTop: "24px" }}>
        <Container maxWidth="sm">
            <div style={{ textAlign: "center"}}>
            <div style={{ textAlign: "center" }}>
                { players.length } { players.length === 1 ? "detective" : "detectives" } present
            </div>
            <div style={{marginTop: "8px"}}>
                <Button size="small" onClick={startNewBroadcast}>
                    Broadcast message
                </Button>
            </div>
            <div style={{ marginTop: "32px"}}>
                {messageMeta && <SecretMessage secretMessage={secretMessage} messageMeta={messageMeta} player={playerId} />}
            </div>
        </div>
        </Container>
        <MessageDialog open={showMessageDialog} handleClose={() => setShowMessageDialog(false)} handleMessageBroadcast={message => broadcastMessage(message, players, playerId)} />
    </div>;
}

const AuthGameView = () => {
    const { authenticatedPlayerId } = useAuthentication();

    return <>
        <span style={{ marginLeft: "8px", fontSize: "10px" }}>ID: { authenticatedPlayerId ? authenticatedPlayerId : "<Not authenticated>" }</span>
        { authenticatedPlayerId && <GameView playerId={authenticatedPlayerId} /> }
    </>
}

export default AuthGameView;