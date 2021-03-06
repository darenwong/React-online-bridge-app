import React, { useState, useEffect} from 'react';
import {Button, Backdrop, CircularProgress, Dialog, DialogTitle, DialogContent, TextField, Snackbar, Slide} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';

import './App.css';
import Messages from './components/messages.jsx'
import Board from './components/board.jsx'
import Bid from './components/bid.jsx'
import SelectPartner from './components/selectPartner.jsx'
import io from 'socket.io-client'
import cardPlayVideo from './videos/cardsplay.mp4';
import LoginPage from './components/loginPage.jsx';
import imgDict from './importSVG';
import backgroundImg from './importBackgroundImg';
import { MdPersonAdd } from "react-icons/md";

import bidAudio from './sound/zapsplat_vehicles_car_radio_button_press_interior_nissan_patrol_2019_002_55345.mp3';
import useSound from 'use-sound';
import cardAudio from './sound/zapsplat_foley_business_card_slide_from_pack_002_32902.mp3';
import TemporaryDrawer from './drawerComponents/drawer.jsx';
import BottomBar from './drawerComponents/bottomBar.jsx';
import Home from './Home';

//const socket = io('http://localhost:4000');
//const ENDPOINT = 'http://localhost:4000';
const ENDPOINT = 'https://floating-bridge-server.herokuapp.com';
const socket = io(ENDPOINT);

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: 1500,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  chatbackdrop:{
    zIndex: 100,
  }
}));

function App() {
  const classes = useStyles();
  
  const [cardAudioPlay, { cardAudioStop }] = useSound(cardAudio);
  const [bgImg, setBgImg] = useState(backgroundImg[0]);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  const [totNoClients, setTotNoClients] = useState(0);
  const [noClients, setNoClients] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);

  const [status, setStatus] = useState('setup');
  const [turn, setTurn] = useState(0);
  const [role, setRole] = useState('');
  const [switchedRole, setSwitchedRole] = useState(false);
  const [players, setPlayers] = useState({"North":null,"South":null,"East":null,"West":null});
  const [spectators, setSpectators] = useState([]);
  const [bid, setBid] = useState(0);
  const [bidlog, setBidLog] = useState([]);
  const [playerBids, setPlayerBids] = useState({"North":[],"South":[],"East":[],"West":[]});
  const [bidWinner, setBidWinner] = useState({"userID":null, "userRole":null, "winningBid":null, "trump": null, "partner": {"val":null,"role":null}});
  const [roundWinner, setRoundWinner] = useState(null);
  const [hand, setHand] = useState([]); 

  const [partnerRevealed, setPartnerRevealed] = useState(false);
  const [partner, setPartner] = useState(null);

  const [turnStatus, setTurnStatus] =  useState({start: null, board:[], trumpBroken:false});
  const [prevBoard, setPrevBoard] = useState([]);
  const [scoreboard, setScoreboard] = useState({"North":0,"East":0,"South":0,"West":0});
  const [winner, setWinner] = useState([]);
  const [disable, setDisable] = useState(false);

  const [chatIsActive, setChatIsActive] = useState(false);
  const [lastTrickIsActive, setLastTrickIsActive] = useState(false);
  const [drawerIsActive, setDrawerIsActive] = useState(false);
  const [loginPageIsActive, setLoginPageIsActive] = useState(false);
  const [socketIsConnected, setSocketIsConnected] = useState(false);
  const [reconnected, setReconnected] = useState(false);

  const [loading, setLoading] = useState({status: false, msg: ''});

  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading({status: true, msg: 'Initialising State'});

    socket.on('updateTotalNumberOfClients', (totNoClients) =>setTotNoClients(totNoClients))

    socket.on('updateState', ({status, disable, clients, turns, bid, bidWinner, bidlog, playerBids, partnerRevealed, partner, roundWinner, players, spectators, turnStatus, prevBoard, scoreboard, winner}) => {
      setLoading({status: false, msg: ''});
      setBidWinner(bidWinner);
      setRoundWinner(roundWinner)
      setStatus(status);
      setTurn(turns);
      setBid(bid);
      setBidLog(bidlog);
      setPlayerBids(playerBids);
      setPlayers(players);
      setSpectators(spectators);
      setTurnStatus(turnStatus);
      setPrevBoard(prevBoard);
      setScoreboard(scoreboard);
      setWinner(winner);
      setNoClients(clients);
      setDisable(disable); 
      setPartnerRevealed(partnerRevealed);
      setPartner(partner);
    });

    socket.on('connection_res', ({user}) =>{
      setName(user.name);
      setRoom(user.room);
      setRoomPassword(user.roomPassword);
    });

    socket.on('newJoiner', (players, spectators)=>{
      setPlayers(players);
      setSpectators(spectators);
    })

    socket.on('allUpdateHand' , () => {
      socket.emit('updateMyHand');
    })

    socket.on('updateHand', hand => {
      setHand(hand);
    })

    socket.on('receivedMsg', (message) => {
      message.read = false;
      setChat(chat => [...chat,message]);
    })

    socket.on('roleSetSuccessful', (data) => {
      setLoading({status: false, msg: ''});
      setRole(data.role);
      setSwitchedRole(true);
      setTimeout(()=>{setSwitchedRole(false)}, 0);
    })

    socket.on('receivedBid', ({selectedBid, turns, bidlog}) =>{
      setBid(selectedBid);
      setBidLog(bidlog);
      setTurn(turns);
    })
    
    socket.io.on('reconnect', (attempt)=>{
      //console.log('reconnect', attempt);
      setReconnected(true);
    })
    socket.io.on('reconnect_attempt', (attempt)=>{
      console.log('reconnect', attempt);
    })

    socket.on('connect_error', ()=>{
        //console.log('connect_error');
        //socket.io.reconnect();
    })
    socket.on('disconnect', ()=>{
      //console.log('disconnected');
      setSocketIsConnected(false);
      setLoading({status: true, msg: 'Reconnecting to server'});
     //socket.connect();
    });

  }, []);

  useEffect(()=>{
    socket.on('connect', ()=>{
      //console.log('reconnecting', name);
      setReconnected(true);
      setSocketIsConnected(true);
      setLoading({status: true, msg: 'Connected'});
      if (name){
        setLoading({status: true, msg: 'Setting username'});
        socket.emit('setUsername_req',name, function callback(requestStatus, user, error){
          if (requestStatus === 400){
            setName(user.name);
            setRoom(user.room);
            //console.log('setUsername', user)
          }else if (requestStatus === 200){
            setName(null);
          }
          setLoading({status: false, msg: ''});
        })

        setLoading({status: true, msg: 'Joining Room'});
        socket.emit('joinRoom_req', room, roomPassword, function callback(requestStatus, msg){
          if (requestStatus === 400){ setIsLoggedIn(true);}
          else {setError(msg);}
          setLoading({status: false, msg: ''});
        });

        setLoading({status: true, msg: 'Setting Role'});
        socket.emit('setRole', {role: "Spectator", type: "Human"});
      } else{
        setLoading({status: false, msg: ''});
      }
    })

    return () => {
      socket.off("connect");
    }
  }, [name])

  useEffect(()=>{
    if (turnStatus.board.length <= 3) playSound("bid-audio");
  }, [turn])

  function handleSendMsg(event) {
    socket.emit('sendMsg', {message: msg, username: name});
    setMsg('');
    event.preventDefault();
  }


  function handleSelectRole(role, event) {
    switch(event) {
      case "AI":
        socket.emit('setRole', {role: role, user: "AI", type: event});
        setLoading({status: true, msg: 'Setting AI'});
        break
      case "Human":
        socket.emit('setRole', {role: role, user: name, type: event});
        (role === "Spectator") ? setLoading({status: true, msg: 'Leaving seat'}) : setLoading({status: true, msg: 'Taking seat'});
        break
      default:
        //console.log('Error: Unidentified role selection', role, event);
    }
  }

  function handleStart(event) {
    event.target.disabled = true;
    socket.emit('requestStart');
    setLoading({status: true, msg: 'Starting game'});
  }

  function handleSelectBid(event) {
    socket.emit('setBid', event);
    setLoading({status: true, msg: 'Bidding'});
  }

  function handleSelectPass(event) {
    event.target.disabled = true;
    socket.emit('setBid', "pass");
    setLoading({status: true, msg: 'Bidding'});
  }

  function handleSelectPartner(selectedPartner) {
    socket.emit('setPartner', {"suite":['c','d','h','s'][Math.floor(selectedPartner/13)],"val":selectedPartner%13,"role":selectedPartner});
    setLoading({status: true, msg: 'Selecting partner'});
  }

  function handleClickCard(event, id,suite,val){
    setDisable(true);
    event.target.disabled = true;
    socket.emit("requestPlayCard", {id:id,suite:suite,val:val});
    setLoading({status: true, msg: 'Playing card'});
  }

  function checkValidCard(id,suite,val) {
    let boardScenario = getBoardAndCardStatus(suite);
    switch(boardScenario) {
      case 0: return true; //NO Trump game, board is EMPTY
      case 1: return true; //NO Trump game, board is NOT EMPTY, card suit matches board starting suit
      case 2: return !handHasBoardStartingSuit(); //NO Trump game, board is NOT EMPTY, card suit does NOT match board starting suit. If hand contains other cards with board starting suit, player must follow board starting suit.
      case 3: return true; //Trump game, board is EMPTY, card suit is Trump suit, but Trump was broken
      case 4: return !handHasNonTrumpSuit(); //Trump game, board is EMPTY, card suit is Trump suit, but Trump was NOT broken
      case 5: return true; //Trump game, board is EMPTY, card suit is NOT Trump suit
      case 6: return true; //Trump game, board is NOT EMPTY, card suit matches board starting suit
      case 7: return !handHasBoardStartingSuit(); //Trump game, board is NOT EMPTY, card suit does NOT match board starting suit. If hand contains other cards with board starting suit, player must follow board starting suit.
      default: throw "Error: Undefined boardScenario encountered";
    }
  }

  function getBoardAndCardStatus(suite) {
    // if this is a NO Trump game
    if (bidWinner.trump === 4){
      // and board is EMPTY
      if (turnStatus.board.length === 0) return 0;
      // and board is NOT EMPTY, and card suit is the same as board starting suit
      else if (turnStatus.start === suite) return 1;
      // and board is NOT EMPTY, and card suit is different from board starting suit
      else { return 2; }
    }
    // if this is a Trump game and board is EMPTY
    else if (turnStatus.board.length === 0){
      // and card suit is trump suit
      if (["c","d","h","s"].indexOf(suite) === bidWinner.trump){
        // and trump was broken
        if (turnStatus.trumpBroken === true) return 3
        // and trump was NOT broken
        else { return 4; };
      }
      // and card is NOT a trump suit
      else return 5;
    }
    // if this is a Trump game and board is NOT EMPTY
    else {
      // and card matches board starting suit
      if (turnStatus.start === suite) return 6;
      // and card does NOT match board starting suit
      else { return 7; };
    }   
  }

  function handHasBoardStartingSuit(){
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].suite === turnStatus.start) return true; //hand contains card with board starting suit. 
    }
    return false; //hand ran out of board starting suit.
  }

  function handHasNonTrumpSuit(){
    for (let i = 0; i < hand.length; i++) {
      if (["c","d","h","s"].indexOf(hand[i].suite) !== bidWinner.trump) return true; //hand contains non-trump suit
    }
    return false; //hand only have trump suit left
  }

  function getNumberPlayers() {
    let count = 0;
    for (const key of Object.keys(players)) {
      if(players[key] !== null) count ++;
    }
    return count;
  }

  function getTurn(turn) {
    return (turn !== null) ? ["North", "East", "South", "West"][turn%4] : null;
  }

  function getCardVal(val) {
    return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][val];
  }

  function getCardDisplay(suite, val) {
    let symbol = {"c": <div className={getCardClass(suite)}>{getCardVal(val-2)}&clubs;</div>, "d": <div className={getCardClass(suite)}>{getCardVal(val-2)}&diams;</div>, "h": <div className={getCardClass(suite)}>{getCardVal(val-2)}&hearts;</div>, "s": <div className={getCardClass(suite)}>{getCardVal(val-2)}&spades;</div>};
    return symbol[suite];
  }

  function getCardClass(suite){
    return ((suite === "c" || suite === "s") ? "bid center" : "bid red center");
  }

  function getCardClassTest(suite){
    return "cardTest";
  }

  function getCardDisableStatus(id,suite,val){
    return disable || status !== "play"|| !checkValidCard(id,suite,val) || getTurn(turn) !== role;
  }

  function getSVGClassName(id,suite,val){
    return (getCardDisableStatus(id,suite,val)) ? "svgClass disable" : "svgClass";
  }

  function getNotificationNumber(){
    let count = 0;
    for (let i=0; i<chat.length; i++){
      if (chat[i].read === false){
        count += 1;
      }
    }
    return count;
  }

  function chatCallback(){
    setChatIsActive(!chatIsActive);
    setLastTrickIsActive(false);
    //console.log(chatIsActive);
  }

  async function playSound(audioClass) {
    const audioEl = document.getElementsByClassName(audioClass)[0];
    if (audioEl) await audioEl.play();
  }

  if (isLoggedIn === true) {
    return (
      
      <div className="App">
        <ServerConnection open={reconnected} handleClose={()=>setReconnected(false)}/>
        <ErrorDialog open={(error)?true:false} error={error}/>

        <UsernameDialog open={(name)?false:true} setLoading={setLoading} socket={socket} setName={setName} setRoom={setRoom}/>

        <Backdrop className={classes.backdrop} open={loading.status}><CircularProgress/> {loading.msg}</Backdrop>
        <TemporaryDrawer exitCallback={()=>setIsLoggedIn(false)} setLoading={setLoading} setBgImg={setBgImg} bidlog={bidlog} bidWinner={bidWinner} name={name} room={room} roomPassword={roomPassword} spectators={spectators} socket={socket} drawerIsActive={drawerIsActive} setDrawerIsActive={setDrawerIsActive}/>
        <BottomBar status={status} bidlog={bidlog} bidWinner={bidWinner} room={room} name={name} spectators={spectators} socket={socket} closeChatCallback={()=>{setChatIsActive(false)}} notificationNumber={getNotificationNumber()} setLastTrickIsActive={setLastTrickIsActive} lastTrickIsActive={lastTrickIsActive} drawerIsActive={drawerIsActive} setDrawerIsActive={setDrawerIsActive} chatCallback={chatCallback}/>
        
        <Backdrop className={classes.chatbackdrop} open={chatIsActive || lastTrickIsActive} onClick={()=>{setChatIsActive(false); setLastTrickIsActive(false)}}></Backdrop>
        
        <div className="mainContainer" style={{backgroundImage:`url(${bgImg})`}}>
          <div className = "playContainer ">
              <Board role={role} status={status} setLoading={setLoading} prevBoard={prevBoard} lastTrickIsActive={lastTrickIsActive} setLastTrickIsActive={setLastTrickIsActive} chatIsActive={chatIsActive} setChatIsActive={setChatIsActive} socket={socket} partnerRevealed={partnerRevealed} partner={partner} winner={winner} bidWinner={bidWinner} playerBids={playerBids} roundWinner={roundWinner} room={room} name={name} scoreboard={scoreboard} turn = {getTurn(turn)} handleSelectRole = {handleSelectRole} players = {players} getNumberPlayers={getNumberPlayers} handleStart={handleStart} spectators={spectators} getCardClass={getCardClass} getCardDisplay={getCardDisplay} turnStatus={turnStatus}/>
              
              {status === "bid" && role !== null && role !== "Spectator" && getTurn(turn) !== role &&
                <div className="bidOuterContainer">
                  <div className="appTextContainer">Waiting for {getTurn(turn)} to bid</div>
                </div>
              }
              {status === "bid" && role !== null && role !== "Spectator" && getTurn(turn) === role &&
                <div className="bidOuterContainer">
                  <div className="appTextContainer">Your turn: select your bid</div>
                  <Bid bid={bid} handleSelectBid={handleSelectBid} handleSelectPass={handleSelectPass} role={role} turn={getTurn(turn)}></Bid>               
                </div>
              }

              {status === "selectPartner" && role != null && getTurn(turn) !== role &&
                <div className="selectPartnerOuterContainer">
                  <div className="appTextContainer">Waiting for {getTurn(turn)} to select partner</div>
                </div>
              }
              {status === "selectPartner" && role != null && getTurn(turn) === role &&
                <div className="selectPartnerOuterContainer">
                  <div className="appTextContainer">Your turn: select your partner</div>
                  <SelectPartner handleSelectPartner={handleSelectPartner} hand={hand}></SelectPartner>
                </div>
              }
          </div>
          <Messages open={chatIsActive} onClose={()=>setChatIsActive(!chatIsActive)} chat={chat} setChat={setChat} socket={socket} noClients={noClients} setMsg = {setMsg} name = {name} msg = {msg} handleSendMsg={handleSendMsg}/>
        </div>
        {status !== "setup" && role != null && role !== "Spectator" && switchedRole === false &&
          <div className="handContainer">
            {hand.map(({id,suite,val}) => <button onMouseEnter={()=>{cardAudioPlay();}} onClick = {(event) => {handleClickCard(event,id,suite,val)}}  disabled={getCardDisableStatus(id,suite,val)} key = {id} className = {getCardClassTest(suite)}><img className={getSVGClassName(id,suite,val)} src={imgDict[suite][val-2]} alt="Logo" /></button>)}
          </div>
        }
        <audio className="bid-audio" preload="auto" crossOrigin="anonymous" src={bidAudio}></audio>
        <audio className="card-audio" preload="auto" crossOrigin="anonymous" src={cardAudio}></audio>
      </div>
    )
  }else{
    return (
      <div>
        <ServerConnection open={reconnected} handleClose={()=>setReconnected(false)}/>
        <ErrorDialog open={(error)?true:false} error={error}/>
        <Backdrop className={classes.backdrop} open={loading.status}><CircularProgress/> {loading.msg}</Backdrop>
        <video autoPlay muted loop className="video">
          <source src={cardPlayVideo} />
        </video>
        <Home openLoginPage={()=>setLoginPageIsActive(true)}/>
        <LoginPage open={loginPageIsActive} onClose={()=>setLoginPageIsActive(false)} setLoading={setLoading} endpoint={ENDPOINT} totNoClients={totNoClients} isLoggedIn = {isLoggedIn} socket={socket} setName = {setName} name = {name} setRoom={setRoom} room={room} spectators = {spectators} players={players} setIsLoggedIn={setIsLoggedIn} socket={socket}/>
      </div>
    );
  }

}

function UsernameDialog(props){
  const [namePlaceholder, setNamePlaceholder] = useState('');
  const [errorFound, setErrorFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function errorCallback(error) {
    setErrorFound(true);
    setErrorMsg(error);
  }

  function handleSetUsername(){
    if (!namePlaceholder) return errorCallback("Can't be empty");

    props.setLoading({status: true, msg: 'Setting username'});
    props.socket.emit('setUsername_req',namePlaceholder, function callback(requestStatus, user, error){
      if (requestStatus === 400){
        props.setName(user.name);
        props.setRoom(user.room);
        //console.log('setUsername', user)
      }else if (requestStatus === 200){
        errorCallback(error);
      }
      props.setLoading({status: false, msg: ''});
    })
  }

  return (
    <>
      <Dialog open={props.open}>
        <DialogTitle id="simple-dialog-title">Set username</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            variant="outlined"
            required
            fullWidth
            error={errorFound}
            helperText={errorMsg}
            onChange={(event) => setNamePlaceholder(event.target.value)}
          />
          <Button fullWidth variant="contained" color="secondary" onClick={handleSetUsername} startIcon={<MdPersonAdd/>}>Set Name</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

function ServerConnection(props){
  let {open, handleClose} = props;
  return (
    <>
      <Snackbar 
        open={open} 
        autoHideDuration={3000} 
        onClose={handleClose}
        TransitionComponent={SlideTransition}
      >
        <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity="success">
          Connected
        </MuiAlert>
      </Snackbar>
    </>
  );
}

function ErrorDialog(props){
  return (
    <>
      <Dialog open={props.open}>
        <DialogTitle id="simple-dialog-title">Error</DialogTitle>
        <DialogContent dividers>
          {props.error}
        </DialogContent>
      </Dialog>
    </>
  )
}


export default App;

