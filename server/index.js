const crypto = require("crypto");
// Import Room, Deck and User Class
const Room = require('./room');
const Deck = require('./deck');
const User = require('./user');
const AI = require('./ai');

// Set up web socket on server side
const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const Joi = require('joi');

app.use(cors());
app.use(express.json());

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors:true,
    origins: '*:*'
});


app.get("/search/:username", async (req,res)=>{
  const schema = Joi.object({
    username: Joi.string().min(2).max(10).required()
  });

  const result = schema.validate(req.params);

  if (result.error) {
    res.statusMessage = result.error.details[0].message;
    res.status(400).end();
    //console.log('schema check search username', result.error.details[0].message);
    return;
  }

  try {
    const response = await pool.query(`SELECT COUNT(username) FROM userlogintable WHERE username = '${req.params.username}';`);
    res.send(response.rows[0].count).status(200);
    //console.log('response search server', response.rows[0].count);
  } catch (error) {
    //console.log('search error: ',error);
  }
})

app.post("/adduser", async (req, res) => {
  //console.log('req',req.body);
    
  const schema = Joi.object({
    name: Joi.string().min(2).max(10).required(),
    password: Joi.string().min(2).max(10).required()
  });

  const result = schema.validate(req.body);

  if (result.error) {
    res.statusMessage = result.error.details[0].message;
    res.status(400).end();
    //console.log('schema check result', result.error.details[0].message);
    return;
  }

  const {name, password} = req.body;
  try {
    const newUser = await pool.query(`INSERT INTO userlogintable (username, password) VALUES ('${name}','${password}');`);
    res.send(newUser);
  } catch (error) {
    //console.log('Error cannot insert into DB', error);
  }
});

app.get("/login/:username/:password", async (req,res)=>{
  try {
    const response = await pool.query(`SELECT COUNT(username) FROM userlogintable WHERE username = '${req.params.username}' AND password = '${req.params.password}';`);
    res.send(response.rows[0].count);
    //console.log('login response success', response.rows[0].count);
  } catch(e) {
    res.statusMessage = "bad login request";
    res.status(400).end();
    //console.log(e, 'bad request');
  }
})
/*
app.post("/", async (req, res) => {
  //console.log('req',req.body);
  const {name} = req.body;
  const newName = await pool.query("INSERT INTO testtable (testname) VALUES ($1)",[name]);
  res.json(newName);
});
*/
// Initialise a global directory of rooms with just one room, which is the main room
let rooms = {'main': new Room() };
// Initialise a global list of users socket ID
let users = [];

// When a client connects
io.on('connection', socket => {
  // Creates a User Object. Initialise user room to main room, and user role to spectator
  let user = new User(socket.id, null, 'main', 'Spectator');
  users.push(user);

  console.log(io.sockets.adapter.rooms);
  io.emit('updateTotalNumberOfClients', users.length);

  // The following code consists of adding various Event Listener to listen for events from client side

  socket.on('generateRoomID_req', (callback)=>{
    let id = crypto.randomBytes(2).toString('hex');
    let password = crypto.randomBytes(2).toString('hex');
    while (rooms[id]){
      id = crypto.randomBytes(2).toString('hex');
    }
    callback(id, password);
  })

  socket.on('createRoom_req', (room, password, callback)=>{
    if (rooms[room]){
      callback(200,"Room ID already exists");
    }else{
      rooms[room] = new Room();
      rooms[room].password = password;
      callback(400, "success");
    }
  })

  socket.on('joinRoom_req', (room, password, callback)=>{
    if (rooms[room]){
      if (rooms[room].password === password){
        socket.join(room);
        rooms[room].clients ++;
        user.room = room;
        user.roomPassword = password;
        rooms[room].spectators.push(user);
        socket.emit('connection_res', {user});
        io.to(user.room).emit('newJoiner', rooms[user.room].players, rooms[user.room].spectators);
        updateState(io, rooms, user.room);

        callback(400, "success");
      }else{
        callback(200,"Incorrect password");
      }
    }else{
      callback(200,"Room does not exist");
    }
  })

  socket.on('setUsername_req', (name, callback)=>{
    for (let i=0; i<users.length; i++){
      if (users[i].name === name){ 
        callback(200, null, "Username already exists");
        return ;
      }
    }
    user.name = name;
    callback(400, user, "success");
    io.to(user.room).emit('newJoiner', rooms[user.room].players, rooms[user.room].spectators);
    io.to(user.room).emit('receivedMsg', {username: "Admin", message: user.name + " joined the room"});
  })

  // Add an event listener for when user wants to change role
  socket.on('setRole', ({role, type}) => {

    switch(type){
      case "AI":
        rooms[user.room].players[role] = new AI("AI",user.room,role);
        checkAndGetAIAction(io, rooms, user.room);
        break
      case "Human":
        // Update the Player list
        rooms[user.room].updatePlayerList(user);
        // Set user role
        user.role = role;
        // Update Spectator list
        rooms[user.room].updateSpectatorList(user);

        // Let user know that his role has been successfully set
        socket.emit('roleSetSuccessful', {role: role});
        break
      default:
        //console.log('Error: Unidentified role detected, neither AI or human')
    }
    updateState(io, rooms, user.room);
    socket.emit('allUpdateHand');
  })

  // Add an event listener for when user send a chat message
  socket.on('sendMsg', (data) => {
    // Handle chat message exchange
    io.to(user.room).emit('receivedMsg', data);
    //console.log("sent message: ", data.message)
  })

  // Add an event listener for when user wants to start game
  socket.on('requestStart', () =>{
    if (rooms[user.room].status !== "setup") return;
    // Change game phase from start to bidding phase
    rooms[user.room].status = "bid";
    
    // Initialise a new Deck Object
    let deck = new Deck();

    // Shuffle and deal the cards to players
    deck.shuffle();
    rooms[user.room].playerHands = deck.deal(rooms[user.room].playerHands);

    ////console.log("players: ", rooms[user.room].players)
    updateState(io, rooms, user.room);
    io.to(user.room).emit('allUpdateHand');
    checkAndGetAIAction(io, rooms, user.room);
  })

  // Add an event listener for when user wants to restart game
  socket.on('requestRestart', () => {
    rooms[user.room].restart();
    updateState(io, rooms, user.room);
  })
  
  // Add an event listener for when user submits a bid
  socket.on('setBid', (selectedBid) => {
    // Increment turn counter for next player to move
    rooms[user.room].turns ++;

    // Set the bid state
    selectedBid = rooms[user.room].setBid(selectedBid, user.name, user.role);
    
    // Broadcast to room that bid is received by server
    io.to(user.room).emit('receivedBid', {selectedBid: selectedBid, turns:rooms[user.room].turns, bidlog:rooms[user.room].bidlog});

    // Determine if there have been consecutive passes. If yes, conclude the bidding round
    rooms[user.room].handleConsecutivePasses(rooms[user.room].bid);
    updateState(io, rooms, user.room);
    checkAndGetAIAction(io, rooms, user.room);
  })

  // Add an event listener for when user plays a card
  socket.on('requestPlayCard', ({id, suite, val}) =>{
    //console.log(user.role + " played " + suite+ " "+ val);

    // Player cannot play twice in the same round. If caught, return
    if (rooms[user.room].checkPlayerPlayedBefore(user.role) === true){ return ;}
    
    // Check and update trump broken status
    rooms[user.room].checkTrumpBrokenStatus(suite);

    // If board is empty, set first card as starting suit
    if (rooms[user.room].turnStatus.board.length === 0){
        rooms[user.room].turnStatus.start = suite;
    }

    // Add card to board
    rooms[user.room].turnStatus.board.push({user: user.role, id:id,suite:suite,val:val});
    if (rooms[user.room].bidWinner.partner.card.id === id){
      //console.log("partner revealed")
      rooms[user.room].partnerRevealed = true;
      rooms[user.room].partner = user.role;
    }


    // Move Card Object from player hand to board
    rooms[user.room].updatePlayerHand(user.role, id);

    // If there are 4 or more cards on the board, we conclude and end the round
    if (rooms[user.room].turnStatus.board.length >= 4){
        // Disable all cards to prevent players from further playing any cards until next round starts
        rooms[user.room].disable = true;
        // Get winner of the round
        let winner = rooms[user.room].getWinner();
        //console.log('winner', winner);
        rooms[user.room].turns = null;
        socket.emit('allUpdateHand');
        updateState(io, rooms, user.room);
        
        // All the following updates will only take effect after timeout
        // Set winner position to start the next round
        rooms[user.room].turns = ["North", "East", "South", "West"].indexOf(winner.user);
        // Add winner score by 1
        rooms[user.room].scoreboard[winner.user] ++;
        rooms[user.room].prevBoard = rooms[user.room].turnStatus.board;
        // Reset board state to empty
        rooms[user.room].turnStatus.board = [];
        // Reset starting card to null
        rooms[user.room].turnStatus.start = null;
        // Set disable back to false
        rooms[user.room].disable = false;
        // Check if game is over and gameover status has been updated. If no, broadcast to room that game is over
        if (rooms[user.room].checkGameOver() === true && rooms[user.room].status != 'gameOver'){rooms[user.room].status = "gameOver";}
        setTimeout(() => {  
          updateState(io, rooms, user.room); 
          checkAndGetAIAction(io, rooms, user.room);
        }, 2000);
    }
    else {
        // Round hasnt ended, increment turn by 1 and let next player play
        rooms[user.room].turns = (rooms[user.room].turns + 1)%4;
        updateState(io, rooms, user.room);
        socket.emit('allUpdateHand');
        checkAndGetAIAction(io, rooms, user.room);
    }
  })

  // Add an event listener for when user requests to update hand
  socket.on('updateMyHand', () => {
    //console.log('updateMyHand', Object.keys(rooms), user.room);
    // If user is not playing, set hand to empty
    (rooms[user.room] && rooms[user.room].playerHands[user.role] === undefined) ? socket.emit('updateHand', []) :socket.emit('updateHand', rooms[user.room].playerHands[user.role]);
    }
  )

  // Add an event listener for when user has chosen his partner
  socket.on('setPartner', ({suite, val, role:partnerID}) => {
    // Search through all four players hand to find who holds the partner card
    for (let player of ["North","East","South","West"]){
        // For each player, search through all 13 cards in hand
        for (i = 0; i < 13; i++){
            if (Number(rooms[user.room].playerHands[player][i].id) === Number(partnerID)){
                rooms[user.room].bidWinner.partner.card = rooms[user.room].playerHands[player][i];
                rooms[user.room].bidWinner.partner.role = player;
                rooms[user.room].status = "play";
                //console.log("partner is ", player, suite, val, rooms[user.room].bidWinner.partner);
                //io.to(user.room).emit('receivedMsg', {username: "Admin", message: rooms[user.room].bidWinner.userRole + " has chosen partner: "+ ["2","3","4","5","6","7","8","9","10","Jack","Queen","King","Ace"][rooms[user.room].bidWinner.partner.card.val] + " of" + {c:" Club", d:" Diamond", h:" Heart", s:" Spade"}[rooms[user.room].bidWinner.partner.card.suite] })
                if (rooms[user.room].bidWinner.trump !== 4) {rooms[user.room].turns++;};
                updateState(io, rooms, user.room);
                checkAndGetAIAction(io, rooms, user.room);
                return ;
            }
        }
    }
  })

  // Add an event listener for when user disconnects from server
  socket.on('disconnect', () => {

    // Remove user from global User Object list
    for (let i = 0; i<users.length; i++){
      if (users[i].socketID === socket.id) {users.splice(i,1);}
    }

    // Update number of clients
    rooms[user.room].clients --;
    
    // Update player and spectator list
    rooms[user.room].updatePlayerList(user);
    user.role = null;
    rooms[user.room].updateSpectatorList(user);

    io.to(user.room).emit('receivedMsg', {username: "Admin", message: user.name + " left the room"});
    updateState(io, rooms, user.room);
  })

})

// By default, host server on localhost: 4000.
http.listen(process.env.PORT || 4000, function() {
  //console.log('listening on port 4000');
})



function checkAndGetAIAction(io, rooms, userRoom) {
  // Delete empty room except for main room
  //if (rooms[userRoom].clients === 0 && userRoom !== 'main') delete rooms[userRoom];
  

  // Handle AI turn and action
  if (rooms[userRoom] && rooms[userRoom].status !== "setup"){
    let currentTurnPlayer = rooms[userRoom].players[getTurn(rooms[userRoom].turns)];
    if (currentTurnPlayer && currentTurnPlayer.type === "AI"){
      currentTurnPlayer.getAction(rooms[userRoom], io, userRoom, 
        updateStateCallback=(newState)=>{
          rooms[userRoom] = newState;
          updateState(io, rooms, userRoom);
        },
        callbackUpdate = (newState)=>{
          rooms[userRoom] = newState;
          setTimeout(()=>{
            updateState(io, rooms, userRoom);
            checkAndGetAIAction(io, rooms, userRoom);
          }, 1000);
        });
    }
  }
}
  
function updateState(io, rooms, userRoom){
  const {status, disable, clients, turns, bid, bidWinner, bidlog, playerBids, partnerRevealed, partner, roundWinner, players, spectators, turnStatus, prevBoard, scoreboard, winner} = rooms[userRoom];
  const bidWinnerCopy = JSON.parse(JSON.stringify(bidWinner));
  bidWinnerCopy.partner.role = null;
  console.log(bidWinnerCopy, bidWinner)
  io.to(userRoom).emit('updateState', ({status, disable, clients, turns, bid, bidWinner: bidWinnerCopy, bidlog, playerBids, partnerRevealed, partner, roundWinner, players, spectators, turnStatus, prevBoard, scoreboard, winner}));
}

function getTurn(turn) {
  return ["North", "East", "South", "West"][turn%4];
}


app.get("/", (req, res) => {
  res.send(users).status(200);
});