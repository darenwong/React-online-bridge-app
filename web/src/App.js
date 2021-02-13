import React, { useState, useEffect} from 'react'
import { Navbar,Nav} from 'react-bootstrap'
import './App.css';
import Messages from './components/messages.jsx'
import Toolbar from './components/toolbar.jsx'
import Board from './components/board.jsx'
import Bid from './components/bid.jsx'
import SelectPartner from './components/selectPartner.jsx'
import io from 'socket.io-client'
import cardPlayVideo from './videos/cardsplay.mp4';
import Login from './components/login.jsx';
import { BsChatQuote } from 'react-icons/bs';
import imgDict from './importSVG';
import backgroundImg from './importBackgroundImg';

import bidAudio from './sound/zapsplat_vehicles_car_radio_button_press_interior_nissan_patrol_2019_002_55345.mp3';
import cardFlipAudio from './sound/zapsplat_leisure_playing_card_turn_over_on_table_001_10410.mp3';
import useSound from 'use-sound';
import cardAudio from './sound/zapsplat_foley_business_card_slide_from_pack_002_32902.mp3';
import TemporaryDrawer from './drawerComponents/drawer.jsx';
import BottomBar from './drawerComponents/bottomBar.jsx';


//const socket = io('http://localhost:4000');
//const ENDPOINT = 'http://localhost:4000';
const ENDPOINT = 'https://floating-bridge-server.herokuapp.com';
const socket = io(ENDPOINT);
let chatIsActiveGlobal = false;

function App() {
  const [boardPlaceholder, setBoardPlaceholder] = useState([]);
  const [cardAudioPlay, { cardAudioStop }] = useSound(cardAudio);
  const [bgImg, setBgImg] = useState(backgroundImg[0]);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [usernames, setUsernames] = useState([]);
  const [noClients, setNoClients] = useState('');
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
  const [scoreboard, setScoreboard] = useState({"North":0,"East":0,"South":0,"West":0});
  const [winner, setWinner] = useState([]);
  const [disable, setDisable] = useState(false);

  const [chatIsActive, setChatIsActive] = useState(false);
  const [lastTrickIsActive, setLastTrickIsActive] = useState(false);
  const [drawerIsActive, setDrawerIsActive] = useState(false);

  useEffect(() => {
    console.log("initialised app")
    socket.on('updateGlobalID', (usernames) =>setUsernames(usernames))

    socket.on('updateState', ({status, disable, clients, turns, bid, bidWinner, bidlog, playerBids, partnerRevealed, partner, roundWinner, players, spectators, turnStatus, scoreboard, winner}) => {
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
      setScoreboard(scoreboard);
      setWinner(winner);
      setNoClients(clients);
      setDisable(disable); 
      setPartnerRevealed(partnerRevealed);
      setPartner(partner);
    });

    socket.on('allUpdateHand' , () => {
      socket.emit('updateMyHand');
    })

    socket.on('updateHand', hand => {
      setHand(hand);
    })

    socket.on('receivedMsg', (message) => {
      (chatIsActiveGlobal===true) ?message.read = true: message.read = false;
      console.log('msg received', chatIsActiveGlobal, message);
      setChat(chat => [...chat,message]);
    })

    socket.on('roleSetSuccessful', (data) => {
      setRole(data.role);
      setSwitchedRole(true);
      setTimeout(()=>{setSwitchedRole(false)}, 0);
    })

    socket.on('receivedBid', ({selectedBid, turns, bidlog}) =>{
      setBid(selectedBid);
      setBidLog(bidlog);
      setTurn(turns);
    })
    
  }, []);

  useEffect(()=>{
    if (turnStatus.board.length > 3) console.log('play',playSound("card-flip-audio"));
    else console.log('play',playSound("bid-audio"));
  }, [turn])

  useEffect(()=>{
    if (chatIsActive === true) {
      let chatDeepCopy = JSON.parse(JSON.stringify(chat));
      console.log("chat active", chatIsActive)
      for (let i=0; i<chatDeepCopy.length; i++){
        chatDeepCopy[i].read = true;
      }
      setChat(chatDeepCopy);
    }
  }, [chatIsActive])

  function handleSendMsg(event) {
    socket.emit('sendMsg', {message: msg, username: name});
    setMsg('');
    event.preventDefault();
  }


  function handleSelectRole(role, event) {
    switch(event) {
      case "AI":
        socket.emit('setRole', {role: role, user: "AI", type: event});
        break
      case "Human":
        socket.emit('setRole', {role: role, user: name, type: event});
        break
      case "Leave":
        socket.emit('setRole', {role: "Spectator", user: name, type: "Human"});
        break
      default:
        console.log('Error: Unidentified role selection', role, event);
    }
  }

  function handleStart(event) {
    event.target.disabled = true;
    socket.emit('requestStart');
  }

  function handleSelectBid(event) {
    socket.emit('setBid', event);
  }

  function handleSelectPass(event) {
    event.target.disabled = true;
    socket.emit('setBid', "pass");
  }

  function handleSelectPartner(selectedPartner) {
    socket.emit('setPartner', {"suite":['c','d','h','s'][Math.floor(selectedPartner/13)],"val":selectedPartner%13,"role":selectedPartner});
  }

  function handleClickCard(event, id,suite,val){
    setDisable(true);
    event.target.disabled = true;
    socket.emit("requestPlayCard", {id:id,suite:suite,val:val});
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

  function getBidWinnerTurn(turn, trump) {
    return (Number(trump) === 4 ? ["North", "East", "South", "West"][Number(turn)%4]: ["North", "East", "South", "West"][(Number(turn)+1)%4]);
  }

  function getCardVal(val) {
    return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][val];
  }

  function getCardDisplay(suite, val) {
    let symbol = {"c": <div className={getCardClass(suite)}>{getCardVal(val-2)}&clubs;</div>, "d": <div className={getCardClass(suite)}>{getCardVal(val-2)}&diams;</div>, "h": <div className={getCardClass(suite)}>{getCardVal(val-2)}&hearts;</div>, "s": <div className={getCardClass(suite)}>{getCardVal(val-2)}&spades;</div>};
    return symbol[suite];
  }

/*  function getCardClass(suite){
    let temp = "btn btn-sm m-2 ";
    return ((suite === "c" || suite === "s") ? temp + "btn-dark" : temp + "btn-danger");
  }*/

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

  function getChatClassName(){
    let temp = "onlineChatContainer";
    if (chatIsActive === true) temp += " active";
    return temp;
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

  function chatBoxCallback() {
    setChatIsActive(!chatIsActive); 
    chatIsActiveGlobal=!chatIsActiveGlobal;
    if (lastTrickIsActive) {setLastTrickIsActive(false)};
  }

  async function playSound(audioClass) {
    const audioEl = document.getElementsByClassName(audioClass)[0];
    if (audioEl) await audioEl.play();
  }

  if (isLoggedIn === true) {
    return (
      
      <div className="App">
        <TemporaryDrawer setBgImg={setBgImg} bidlog={bidlog} bidWinner={bidWinner} room={room} name={name} spectators={spectators} socket={socket} setBoardPlaceholder={setBoardPlaceholder} drawerIsActive={drawerIsActive} setDrawerIsActive={setDrawerIsActive}/>
        <BottomBar status={status} bidlog={bidlog} bidWinner={bidWinner} room={room} name={name} spectators={spectators} socket={socket} setBoardPlaceholder={setBoardPlaceholder} chatBoxCallback={chatBoxCallback} closeChatCallback={()=>{setChatIsActive(false); chatIsActiveGlobal=false}} notificationNumber={getNotificationNumber()} setLastTrickIsActive={setLastTrickIsActive} lastTrickIsActive={lastTrickIsActive} drawerIsActive={drawerIsActive} setDrawerIsActive={setDrawerIsActive}/>
        
        <div className={(chatIsActive || lastTrickIsActive)?"overlay active":"overlay"} onClick={()=>{setChatIsActive(false); setLastTrickIsActive(false); chatIsActiveGlobal=false}}></div>
        
        <div className="mainContainer" style={{backgroundImage:`url(${bgImg})`}}>
          <div className = "playContainer ">
              <Board role={role} status={status} boardPlaceholder={boardPlaceholder} setBoardPlaceholder={setBoardPlaceholder} lastTrickIsActive={lastTrickIsActive} setLastTrickIsActive={setLastTrickIsActive} chatIsActive={chatIsActive} setChatIsActive={setChatIsActive} socket={socket} partnerRevealed={partnerRevealed} partner={partner} winner={winner} bidWinner={bidWinner} playerBids={playerBids} roundWinner={roundWinner} room={room} name={name} scoreboard={scoreboard} turn = {getTurn(turn)} handleSelectRole = {handleSelectRole} players = {players} getNumberPlayers={getNumberPlayers} handleStart={handleStart} spectators={spectators} getCardClass={getCardClass} getCardDisplay={getCardDisplay} turnStatus={turnStatus}/>
              
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
          <div className = {getChatClassName()}>
            <Messages chat={chat} noClients={noClients} setMsg = {setMsg} name = {name} msg = {msg} handleSendMsg={handleSendMsg}/>
          </div>
        </div>
        {status !== "setup" && role != null && role !== "Spectator" && switchedRole === false &&
          <div className="handContainer">
            {hand.map(({id,suite,val}) => <button onMouseEnter={()=>{cardAudioPlay();}} onClick = {(event) => {handleClickCard(event,id,suite,val)}}  disabled={getCardDisableStatus(id,suite,val)} key = {id} className = {getCardClassTest(suite)}><img className={getSVGClassName(id,suite,val)} src={imgDict[suite][val-2]} alt="Logo" /></button>)}
          </div>
        }
        <audio className="bid-audio" preload="auto" crossOrigin="anonymous" src={bidAudio}></audio>
        <audio className="card-audio" preload="auto" crossOrigin="anonymous" src={cardAudio}></audio>
        <audio className="card-flip-audio" preload="auto" crossOrigin="anonymous" src={cardFlipAudio}></audio>
      </div>
    )
  }else{
    return (
      <div className="App">
        <Toolbar className= "toolBarContainer" socket={socket}/>
        
        <video autoPlay muted loop className="video">
          <source src={cardPlayVideo} />
        </video>
        
        <Login endpoint={ENDPOINT} usernames={usernames} isLoggedIn = {isLoggedIn} socket={socket} setName = {setName} name = {name} setRoom={setRoom} room={room} spectators = {spectators} players={players} setIsLoggedIn={setIsLoggedIn}/>

        <div className="navrow2">
          <Navbar bg="dark" variant="dark" style={{width:'100%'}}>
            {isLoggedIn && <Navbar.Text>{"Room ID: " + room}</Navbar.Text>}
            <Nav className="mr-auto"></Nav>
            <Navbar.Text>{(usernames.length===1)?usernames.length + " player is online":usernames.length + " players are online"}</Navbar.Text>
          </Navbar>
        </div>
      </div>
    );
  }

}
/*{status !== "setup" &&
<div className="handContainer">
  {hand.map(({id,suite,val}) => <button onMouseEnter={cardAudioPlay} onMouseLeave={cardAudioStop} onClick = {(event) => handleClickCard(event,id,suite,val)}  disabled={getCardDisableStatus(id,suite,val)} key = {id} className = {getCardClassTest(suite)}><img className={getSVGClassName(id,suite,val)} src={imgDict[suite][val-2]} alt="Logo" /></button>)}
</div>
}*/
export default App;

