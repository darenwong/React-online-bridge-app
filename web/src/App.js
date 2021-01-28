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

const socket = io('http://localhost:4000');
//const socket = io('https://floating-bridge-online.herokuapp.com/');

function App() {
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
  const [players, setPlayers] = useState({"North":null,"South":null,"East":null,"West":null});
  const [spectators, setSpectators] = useState([]);
  const [bid, setBid] = useState(0);
  const [bidlog, setBidLog] = useState([]);
  const [playerBids, setPlayerBids] = useState({"North":[],"South":[],"East":[],"West":[]});
  const [bidWinner, setBidWinner] = useState({"userID":null, "userRole":null, "winningBid":null, "trump": null, "partner": {"val":null,"role":null}});
  const [hand, setHand] = useState([]); 

  const [turnStatus, setTurnStatus] =  useState({start: null, board:[], trumpBroken:false})
  const [scoreboard, setScoreboard] = useState({"North":0,"East":0,"South":0,"West":0})
  const [winner, setWinner] = useState([]);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    console.log("initialised app")
    socket.on('updateGlobalID', (usernames) =>setUsernames(usernames))

    socket.on('updateState', ({status, disable, clients, turns, bid, bidWinner, bidlog, playerBids, players, spectators, turnStatus, scoreboard, winner}) => {
      console.log('number clients B', clients, players)
      setBidWinner(bidWinner);
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
    });

    socket.on('allUpdateHand' , () => {
      socket.emit('updateMyHand');
    })

    socket.on('updateHand', hand => {
      setHand(hand);
    })

    socket.on('receivedMsg', (data) => {
      setChat(chat => [...chat,data]);
    })

    socket.on('roleSetSuccessful', (data) => {
      setRole(data.role);
    })

    socket.on('receivedBid', ({selectedBid, turns, bidlog}) =>{
      setBid(selectedBid);
      setBidLog(bidlog);
      setTurn(turns);
    })
    
  }, []);

  function handleSendMsg(event) {
    socket.emit('sendMsg', {message: msg, username: name});
    setMsg('');
    event.preventDefault();
  }
/*
  function handleSelectRole(role, event) {
    socket.emit('setRole', {role: role, user: name});
  }
*/
  function handleSelectRole(role, event) {
    switch(event) {
      case "AI":
        socket.emit('setRole', {role: role, user: "AI", type: event});
        break
      case "Human":
        socket.emit('setRole', {role: role, user: name, type: event});
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
    return ["North", "East", "South", "West"][turn%4];
  }

  function getBidWinnerTurn(turn, trump) {
    return (Number(trump) === 4 ? ["North", "East", "South", "West"][Number(turn)%4]: ["North", "East", "South", "West"][(Number(turn)+1)%4]);
  }

  function getCardVal(val) {
    return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][val];
  }

  function getCardDisplay(suite, val) {
    let symbol = {"c": <div>&clubs;{getCardVal(val-2)}</div>, "d": <div>&diams;{getCardVal(val-2)}</div>, "h": <div>&hearts;{getCardVal(val-2)}</div>, "s": <div>&spades;{getCardVal(val-2)}</div>};
    return symbol[suite];
  }

  function getCardClass(suite){
    let temp = "btn btn-sm m-2 ";
    return ((suite === "c" || suite === "s") ? temp + "btn-dark" : temp + "btn-danger");
  }


  if (isLoggedIn === true) {
    return (
      <div className="App">
        <Toolbar className= "toolBarContainer" usernames={usernames} isLoggedIn = {isLoggedIn} socket={socket} setName = {setName} name = {name} setRoom={setRoom} room={room} spectators = {spectators} players={players} setIsLoggedIn={setIsLoggedIn}/>
        
        <div className="mainContainer">
          <div className = "playContainer ">
            <div className="mt-2"></div>
              <Board status={status} socket={socket} winner={winner} bidWinner={bidWinner} bidlog={bidlog} playerBids={playerBids} room={room} scoreboard={scoreboard} turn = {getTurn(turn)} handleSelectRole = {handleSelectRole} players = {players} getNumberPlayers={getNumberPlayers} handleStart={handleStart} spectators={spectators} getCardClass={getCardClass} getCardDisplay={getCardDisplay} turnStatus={turnStatus}/>
              
              {status === "bid" && role !== null && role !== "Spectator" &&
                <div>
                  <Bid bid={bid} handleSelectBid={handleSelectBid} handleSelectPass={handleSelectPass} role={role} turn={getTurn(turn)}></Bid>               
                </div>
              }
              {status === "selectPartner" && role != null && getTurn(turn) === role &&
                <div>
                  <div className="ml-2">Your partner:</div>
                  <SelectPartner handleSelectPartner={handleSelectPartner} hand={hand}></SelectPartner>
                </div>
              }
              {hand.length > 0 && role !== "Spectator" && status !=="setup" &&
                  <div className="handContainer">
                    <div className=" ml-2 ">Your hand:</div>
                    <div className="cardContainer">
                      {hand.map(({id,suite,val}) => <button onClick = {(event) => handleClickCard(event,id,suite,val)}  disabled = {disable || status !== "play"|| !checkValidCard(id,suite,val) || getTurn(turn) !== role} key = {id} className = {getCardClass(suite)}>{getCardDisplay(suite, val)} </button>)}
                    </div>
                  </div> 
              }
          </div>
          <div className = "onlineChatContainer">
            <Messages chat={chat} noClients={noClients} setMsg = {setMsg} name = {name} msg = {msg} handleSendMsg={handleSendMsg}/>
          </div>
        </div>
        
        <Navbar bg="dark" variant="dark" className="navrow2">
          {isLoggedIn && <Navbar.Text>{"Room ID: " + room}</Navbar.Text>}
          <Nav className="mr-auto"></Nav>
          <Navbar.Text>{(usernames.length===1)?usernames.length + " player is online":usernames.length + " players are online"}</Navbar.Text>
        </Navbar>
      </div>
    )
  }else{
    return (
      <div className="App">
        <Toolbar className= "toolBarContainer" socket={socket}/>
        
        <video autoPlay muted loop className="video">
          <source src={cardPlayVideo} />
        </video>
        
        <Login usernames={usernames} isLoggedIn = {isLoggedIn} socket={socket} setName = {setName} name = {name} setRoom={setRoom} room={room} spectators = {spectators} players={players} setIsLoggedIn={setIsLoggedIn}/>

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

export default App;

