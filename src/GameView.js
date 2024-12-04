import './App.css';
import React, { useEffect, useState } from 'react';
import { Button, Container, Dialog, DialogContent, DialogTitle, TextField } from '@mui/material';
import { makeStyles } from "@mui/styles";
import VisibilityIcon from '@mui/icons-material/Visibility';

import useAuthentication from './use_authentication';
import useGameData from './use_game_data';
import useUsername from './use_username';
import { joinGame, broadcastMessage, clearMessage } from './game_actions';

const useStyles = makeStyles({
  topScrollPaper: {
    alignItems: 'flex-start',
  },
  topPaperScrollBody: {
    verticalAlign: 'top',
  },
});

const MessageDialog = ({ open, handleClose, handleMessageBroadcast }) => {
  const classes = useStyles()

  const [secretMessage, setSecretMessage] = useState("");

  const handleSubmit = (e) => {
    handleMessageBroadcast(secretMessage);
    setSecretMessage("");
    handleClose();
    e.preventDefault();
  }

  return <Dialog open={open} onClose={handleClose} classes={{
        scrollPaper: classes.topScrollPaper,
        paperScrollBody: classes.topPaperScrollBody,
      }}>
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

const NoMessage = () => {
    return <div><h3>Waiting for message...</h3></div>;
}

const SecretMessage = ({ secretMessage, isConspirator }) => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (opacity > 0) {
            const timeout = setTimeout(() => { setOpacity(opacity - 0.1)}, 150)
            return () => clearTimeout(timeout);
        }
    }, [opacity])

    return (<>
        <Button 
            color="error" 
            onClick={() => setOpacity(1)} 
            variant="contained" size="large" 
            startIcon={<VisibilityIcon />}
        >
            Reveal
        </Button>
        { opacity > 0 && <div style={{ opacity }}>
            { isConspirator ? <>
                <h2 style={{ color: "red", marginBottom: "2px" }}>{"<ACCESS DENIED>"}</h2>
                <h5 style={{ marginTop: "2px"}}>(you are the conspirator)</h5>
            </>
            : 
            <h1 style={{ opacity }}>
                "{secretMessage && secretMessage.trim()}"
            </h1>
            }
        </div>}
    </>)
}

const Message = ({ secretMessage, messageMeta, player }) => {
    
    if (!messageMeta) {
        return <NoMessage />;
    }
    
    const { conspirator, recipients, broadcaster } = messageMeta;

    const isRecipient = recipients.includes(player);
    const isConspirator = player === conspirator;
    const isBroadcaster = player === broadcaster;    

    if (!isRecipient) {
        return <NoMessage />;
    }

    const title = isBroadcaster ? `Your message was broadcasted to ${recipients.length - 1} people` : `Secret message received`;

    return <div>
        <h3>{title}</h3>
        <div>
            <SecretMessage secretMessage={secretMessage} isConspirator={isConspirator} />
        </div>
    </div>
}

const JoinGameView = ({ onJoinGame }) => {
    const [username, setUsername] = useState(null)
    return <div>
        <h3>Join the game</h3>
        <div style={{ textAlign: "center"}}>
            Enter your name to join
        </div>
        <div>
            <TextField inputProps={{[`data-1p-ignore`]: true}} type="input" value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <Button disabled={!username || username.length === 0}size="small" disableRipple onClick={() => onJoinGame(username)}>
            Join
        </Button>
    </div>
}

const GameView = ({ playerId }) => {
    const gameData = useGameData();
    const [showMessageDialog, setShowMessageDialog] = useState(false);
    const { loading, players, secretMessage, messageMeta } = gameData;
    const { username, updateUsername } = useUsername();
    const [ lastConspirator, setLastConspirator] = useState(null);

    useEffect(() => {
        if (username) {
            joinGame(playerId, username);
        }
    }, [playerId, username])

    useEffect(() => {
        if (messageMeta && messageMeta.conspirator) {
            setLastConspirator(messageMeta.conspirator);
        }
    }, [messageMeta, setLastConspirator])

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
                { players.length } { players.length === 1 ? "detective" : "detectives" } present:
                <div>
                    { players.map((p, i) => <span key={i}>{p.id === playerId ? <b>{`${p.username} (you)`}</b> : p.username}{i < players.length - 1 ? ", " : ""}</span>) }
                </div>
            </div>
            { username ? <>
            <div style={{marginTop: "8px"}}>
                <Button size="small" onClick={startNewBroadcast} disableRipple>
                    Broadcast message
                </Button>
            </div>
            <div style={{ marginTop: "32px"}}>
                <Message secretMessage={secretMessage} messageMeta={messageMeta} player={playerId} />
            </div>
            </>
            : <JoinGameView onJoinGame={(newUsername) => {
                updateUsername(newUsername);
            }} /> }
        </div>
        </Container>
        { showMessageDialog && <MessageDialog open={true} handleClose={() => setShowMessageDialog(false)} handleMessageBroadcast={message => broadcastMessage(message, players, playerId, lastConspirator)} /> }
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