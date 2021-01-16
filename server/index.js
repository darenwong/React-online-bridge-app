const Room = require('./room');
const Deck = require('./deck');

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors:true,
    origins: '*:*'
});

app.get("/", (req, res) => {
    res.send({ response: "Server is up and running. " + users.join(" , ")}).status(200);
  });


var rooms = {'main': new Room() };
let users = [];
let usernames = [];


io.on('connection', socket => {
  let userID;
  let userRoom = 'main';
  users.push(socket.id);
  var userRole = "Spectator";
  socket.emit('roleSetSuccessful', {role: userRole});
  console.log('a user is connected');
  rooms[userRoom].clients ++;
  updateState(io, rooms, userRoom, usernames);


  socket.on('setUsernameRoom', ({name, room}) => {
    usernames.push(name);
    console.log(name + ' is connected to room: ' + room, usernames);
    userID = name;
    userRoom = room;
    if (Object.keys(rooms).indexOf(userRoom) === -1){
        rooms[userRoom] = new Room();
    }
    socket.join(userRoom);
    rooms[userRoom].spectators.push(userID);
    rooms[userRoom].clients ++;
    updateState(io, rooms, userRoom, usernames);
  })


  socket.on('requestRestart', () => {
    rooms[userRoom].restart();
    updateState(io, rooms, userRoom, usernames);
  })
  

  socket.on('setRole', ({role, user:name}) => {
    userRole = role;
    console.log('before', rooms[userRoom].players)
    rooms[userRoom].updatePlayerList(userID);
    rooms[userRoom].updateSpectatorList(name, role);
    console.log('after', rooms[userRoom].players)
    socket.emit('roleSetSuccessful', {role: role});
    updateState(io, rooms, userRoom, usernames);
  })


  socket.on('setBid', (selectedBid) => {
    rooms[userRoom].turns ++;
    rooms[userRoom].ipass ++;
    rooms[userRoom].setBid(selectedBid, userID, userRole);
    
    io.to(userRoom).emit('receivedBid', {selectedBid: selectedBid, turns:rooms[userRoom].turns, bidlog:rooms[userRoom].bidlog});

    rooms[userRoom].handleConsecutivePasses(selectedBid);

    if (rooms[userRoom].status === "selectPartner"){
        io.to(userRoom).emit('receivedMsg', {username: "Admin", message: rooms[userRoom].bidWinner.userRole +" won the bid. Trump: " + ['Club', 'Diamond', 'Heart', 'Spade', 'No Trump'][rooms[userRoom].bidWinner.trump] + ", bid: "+rooms[userRoom].bidWinner.winningBid});
        io.to(userRoom).emit('receivedMsg', {username: "Admin", message: "Please wait while " + rooms[userRoom].bidWinner.userRole + " selects a partner"});
    }
    
    updateState(io, rooms, userRoom, usernames);
  })


  socket.on('requestStart', () =>{
    rooms[userRoom].status = "bid";
    
    let deck = new Deck();
    deck.shuffle();
    rooms[userRoom].playerHands = deck.deal(rooms[userRoom].playerHands);
    console.log("players: ", rooms[userRoom].players)
    updateState(io, rooms, userRoom, usernames);
  })


  socket.on('sendMsg', (data) => {
    io.to(userRoom).emit('receivedMsg', data);
    console.log("sent message: ", data.message)
  })


  socket.on('disconnect', () => {
    // Remove user from global username list
    if (usernames.indexOf(userID) > -1) usernames.splice(usernames.indexOf(userID),1);

    // Remove user from global socket ID list
    let indexID = users.indexOf(socket.id);
    if (indexID > -1) {
        users.splice(indexID, 1);
    }
    
    // Update number of clients
    rooms[userRoom].clients --;
    if (userRoom !== "main") rooms["main"].clients --;
    
    rooms[userRoom].updatePlayerList(userID);
    rooms[userRoom].updateSpectatorList(userID, null);

    updateState(io, rooms, userRoom, usernames);
    console.log('user is disconnected');
  })

  socket.on('requestPlayCard', ({id, suite, val}) =>{
    console.log(userRole + " played " + suite+ " "+ val);

    let temp = [];
    for (let i=0; i<rooms[userRoom].turnStatus.board.length; i++){
        temp.push(rooms[userRoom].turnStatus.board[i].user);
    }
    if (temp.indexOf(userRole)>-1){
        return ;
    }

    if (suite === ["c","d","h","s"][rooms[userRoom].bidWinner.trump] && rooms[userRoom].turnStatus.trumpBroken === false){
        rooms[userRoom].turnStatus.trumpBroken = true;
        io.to(userRoom).emit('receivedMsg', {username: "Admin", message: "Trump is broken!"});
    }
    if (rooms[userRoom].turnStatus.board.length === 0){
        rooms[userRoom].turnStatus.start = suite;
    }
    rooms[userRoom].turnStatus.board.push({user: userRole, id:id,suite:suite,val:val});
    console.log(rooms[userRoom].playerHands, userRole);
    console.log({id:id,suite:suite,val:val});

    rooms[userRoom].playerHands[userRole].forEach(function (card, index) {
        if (id === card.id){
            rooms[userRoom].playerHands[userRole].splice(index, 1);
        }
    });

    
    if (rooms[userRoom].turnStatus.board.length >= 4){
        rooms[userRoom].disable = true;
        updateState(io, rooms, userRoom, usernames);
        var winner = rooms[userRoom].turnStatus.board[0]
        rooms[userRoom].turnStatus.board.forEach(function (card, index) {
            if (index === 0){
                winner = card;
            }
            else if (card.suite === winner.suite && card.val > winner.val){
                winner = card;
            }
            else if (card.suite === ["c","d","h","s"][rooms[userRoom].bidWinner.trump] && rooms[userRoom].turnStatus.trumpBroken){
                if (winner.suite !== ["c","d","h","s"][rooms[userRoom].bidWinner.trump]){
                    winner = card;
                }
                else if (card.val > winner.val){
                    winner = card;
                }
            }
        })
        rooms[userRoom].turns = ["North", "East", "South", "West"].indexOf(winner.user)
        rooms[userRoom].scoreboard[winner.user] ++;
        rooms[userRoom].turnStatus.board = [];
        rooms[userRoom].turnStatus.start = null;
        rooms[userRoom].disable = false;
        setTimeout(() => {  updateState(io, rooms, userRoom, usernames); }, 2000);
    }
    else {
        rooms[userRoom].turns = (rooms[userRoom].turns + 1)%4;
        updateState(io, rooms, userRoom, usernames);
    }
    
  })

  socket.on('updateMyHand', () => {
    if (rooms[userRoom].playerHands[userRole] === undefined){
        socket.emit('updateHand', []);
    }
    else{
        socket.emit('updateHand', rooms[userRoom].playerHands[userRole]);
    }
  })

  socket.on('setPartner', ({suite, val, role:partnerID}) => {
    for (let player of ["North","East","South","West"]){
        for (i = 0; i < 13; i++){
            console.log("check partner is ", rooms[userRoom].playerHands[player][i].id, partnerID);
            if (Number(rooms[userRoom].playerHands[player][i].id) === Number(partnerID)){
                rooms[userRoom].bidWinner.partner = {suite: suite, val:val};
                rooms[userRoom].partnerRole = player;
                rooms[userRoom].status = "play";
                console.log("partner is ", player, suite, val, rooms[userRoom].bidWinner.partner);
                io.to(userRoom).emit('receivedMsg', {username: "Admin", message: rooms[userRoom].bidWinner.userRole + " has chosen partner: "+ ["2","3","4","5","6","7","8","9","10","Jack","Queen","King","Ace"][rooms[userRoom].bidWinner.partner.val] + " of" + {c:" Club", d:" Diamond", h:" Heart", s:" Spade"}[rooms[userRoom].bidWinner.partner.suite] })
                updateState(io, rooms, userRoom, usernames);
                return ;
            }
        }
    }
  })
})

http.listen(process.env.PORT || 4000, function() {
  console.log('listening on port 4000');
})



function updateState(io, rooms, userRoom, usernames) {
    console.log("active rooms: ", Object.keys(rooms));
    io.to(userRoom).emit('allUpdateHand');
    if (rooms[userRoom].partnerRole !== null && Object.values(rooms[userRoom].scoreboard).reduce((a, b) => a + b) === 13) {
        let score = 0;
        if (rooms[userRoom].scoreboard[rooms[userRoom].partnerRole] + rooms[userRoom].scoreboard[rooms[userRoom].bidWinner.userRole] >= rooms[userRoom].bidWinner.winningBid + 6){
            rooms[userRoom].winner = [rooms[userRoom].partnerRole, rooms[userRoom].bidWinner.userRole];
            score = rooms[userRoom].scoreboard[rooms[userRoom].partnerRole] + rooms[userRoom].scoreboard[rooms[userRoom].bidWinner.userRole];
        }
        else { 
            score = 13 - rooms[userRoom].scoreboard[rooms[userRoom].partnerRole] - rooms[userRoom].scoreboard[rooms[userRoom].bidWinner.userRole];
            for (let role of ["North", "East", "South", "West"]){
                if (!(role === rooms[userRoom].partnerRole || role === rooms[userRoom].bidWinner.userRole)) {
                    rooms[userRoom].winner.push(role);
                }
            }
        }
        if (rooms[userRoom].status != 'gameOver') io.to(userRoom).emit('receivedMsg', {username: "Admin", message: rooms[userRoom].winner[0] + " and " + rooms[userRoom].winner[1] + " have won with " + score + " tricks! Click Restart to play again"});
        rooms[userRoom].status = "gameOver";
    }
    if (rooms[userRoom].clients === 0 && userRoom !== 'main') delete rooms[userRoom];
    io.to(userRoom).emit('updateState', (rooms[userRoom]));
    io.emit('updateGlobalID', usernames);
}
    


