import React, { useState, useEffect} from 'react'
import { Navbar,Nav} from 'react-bootstrap'
import io from 'socket.io-client'
import './App.css';
import Messages from './components/messages.jsx'
import Toolbar from './components/toolbar.jsx'
import Board from './components/board.jsx'
import Bid from './components/bid.jsx'
import SelectPartner from './components/selectPartner.jsx'
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
  const [bidWinner, setBidWinner] = useState({"userID":null, "userRole":null, "winningBid":null, "trump": null, "partner": {"val":null,"role":null}});
  const [hand, setHand] = useState([]); 

  const [turnStatus, setTurnStatus] =  useState({start: null, board:[], trumpBroken:false})
  const [scoreboard, setScoreboard] = useState({"North":0,"East":0,"South":0,"West":0})
  const [winner, setWinner] = useState([]);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    socket.on('updateGlobalID', (usernames) =>setUsernames(usernames))

    socket.on('updateState', ({room, status, disable, clients, turns, bid, bidWinner, bidlog, playerHands, players, receiver, spectators, turnStatus, scoreboard, winner}) => {

      setBidWinner(bidWinner);

      //console.log("update", status, turns, bid, bidWinner, bidlog, playerHands, players, receiver, spectators, turnStatus, scoreboard)
      setStatus(status);
      setTurn(turns);
      setBid(bid);
      setBidLog(bidlog);
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
      ////console.log("deal player hand ", hand)
    })

    socket.on('receivedMsg', (data) => {
      setChat(chat => [...chat,data]);
    })

    socket.on('roleSetSuccessful', (data) => {
      setRole(data.role);
      ////console.log("Set " + name + " to " + data.role);
    })

    socket.on('receivedBid', ({selectedBid, turns, bidlog}) =>{
      setBid(selectedBid);
      setBidLog(bidlog);
      setTurn(turns);
      //console.log("receiveBid " + selectedBid);
    })
  }, []);



  function handleSendMsg(event) {
    socket.emit('sendMsg', {message: msg, username: name});
    setMsg('');
    event.preventDefault();
  }

  function handleSelectRole(data, event) {
    socket.emit('setRole', {role: data, user: name});
  }

  function handleStart(event) {
    event.target.disabled = true;
    socket.emit('requestStart');
  }

  function handleSelectBid(event) {
    //console.log(event);
    socket.emit('setBid', event);
  }

  function handleSelectPass(event) {
    //console.log(event);
    event.target.disabled = true;
    socket.emit('setBid', "pass");
  }

  function handleSelectPartner(selectedPartner) {
    //console.log("Selected Partner: ", selectedPartner);
    socket.emit('setPartner', {"suite":['c','d','h','s'][Math.floor(selectedPartner/13)],"val":selectedPartner%13,"role":selectedPartner});
  }

  function handleClickCard(event, id,suite,val){
    //console.log("play card", id, suite, val)
    setDisable(true);
    event.target.disabled = true;
    socket.emit("requestPlayCard", {id:id,suite:suite,val:val})
  }

  function checkValidCard(id,suite,val) {
    //console.log("check valid "+ suite+val);
    if (bidWinner.trump === 4){
      if (turnStatus.board.length === 0) return true;
      else{
        if (turnStatus.start === suite) return true;
        else {
          for (let i = 0; i < hand.length; i++) {
            if (hand[i].suite === turnStatus.start) return false;
          }
          return true
        }
      }
    }

    if (turnStatus.board.length === 0){
      if (["c","d","h","s"].indexOf(suite) === bidWinner.trump){
        if (turnStatus.trumpBroken === true) return true
        else {
          for (let i = 0; i < hand.length; i++) {
            //console.log(hand[i].suite, bidWinner.trump)
            if (["c","d","h","s"].indexOf(hand[i].suite) !== bidWinner.trump) return false;
          }
          return true;
        };
      }
      else return true;
    }
    else {
      if (turnStatus.start === suite) return true;
      else {
        for (let i = 0; i < hand.length; i++) {
          if (hand[i].suite === turnStatus.start) return false;
        }
        return true;
      }
    }
    //return false;
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
    //console.log("if no trump: ",Number(trump) , Number(trump) === 4 , ["North", "East", "South", "West"][Number(turn)%4], " else: ", ["North", "East", "South", "West"][Number(turn+1)%4])
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

  return (
    <div className="App">
      <Toolbar className= "toolBarContainer" usernames={usernames} isLoggedIn = {isLoggedIn} socket={socket} setName = {setName} name = {name} setRoom={setRoom} room={room} spectators = {spectators} players={players} setIsLoggedIn={setIsLoggedIn}/>
      
      {isLoggedIn &&
        <div className="mainContainer">
          <div className = "playContainer ">
            <div className="mt-2"></div>
              <Board status={status} socket={socket} winner={winner} bidWinner={bidWinner} bidlog={bidlog} room={room} scoreboard={scoreboard} turn = {getTurn(turn)} handleSelectRole = {handleSelectRole} players = {players} getNumberPlayers={getNumberPlayers} handleStart={handleStart} spectators={spectators} getCardClass={getCardClass} getCardDisplay={getCardDisplay} turnStatus={turnStatus}/>
              
              {status === "bid" && role !== null && role !== "Spectator" &&
                <div>
                  <div className="spacer "></div>
                  <Bid bid={bid} handleSelectBid={handleSelectBid} handleSelectPass={handleSelectPass} role={role} turn={getTurn(turn)}></Bid>               
                </div>
              }
              {status === "selectPartner" && role != null && getBidWinnerTurn(turn, bidWinner.trump) === role &&
                <div>
                  <div className="spacer "></div>
                  <div className="ml-2">Your partner:</div>
                  <SelectPartner handleSelectPartner={handleSelectPartner} hand={hand}></SelectPartner>
                </div>
              }
              {hand.length > 0 && role !== "Spectator" && status !=="setup" &&
                  <div className="handContainer">
                    <div className="spacer "></div>
                    <div className=" ml-2 ">Your hand:</div>
                    <div className="cardContainer">
                      {hand.map(({id,suite,val}) => <button onClick = {(event) => handleClickCard(event,id,suite,val)}  disabled = {disable || status !== "play"|| !checkValidCard(id,suite,val) || getTurn(turn) !== role} key = {id} className = {getCardClass(suite)}>{getCardDisplay(suite, val)} </button>)}
                    </div>
                  </div>
              }
          </div>
          <div className="spacer "></div>
          <div className = "onlineChatContainer">
            <Messages chat={chat} noClients={noClients} setMsg = {setMsg} name = {name} msg = {msg} handleSendMsg={handleSendMsg}/>
          </div>
         
        </div>
      }   
      
      <Navbar bg="dark" variant="dark" className="navrow2">
        {isLoggedIn && <Navbar.Text>{"Room ID: " + room}</Navbar.Text>}
        <Nav className="mr-auto"></Nav>
        <Navbar.Text>{(usernames.length===1)?usernames.length + " player is online":usernames.length + " players are online"}</Navbar.Text>
      </Navbar>
    </div>
  );
}

export default App;

