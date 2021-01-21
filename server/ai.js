const Deck = require('./deck');

class AI {
    constructor(name, room, role) {
        this.name = name;
        this.room = room;
        this.role = role;
        this.type = "AI";
        //this.initialiseWebSockets();


        this.disable=false, 
        this.turns=0, 
        this.status="setup", 
        this.bid=0, 
        this.bidlog=[], 
        this.bidWinner={
            userID:null, 
            userRole:null, 
            winningBid:null, 
            trump: null, 
            partner: {
                "suite":null,
                "val":null,
                "role":null // To Do: Put this as a private state, do not send to client
            }
        }, 
        this.playerHands={ // To Do: Put this as a private state, do not send to client
            "North":[],
            "East":[],
            "South":[],
            "West":[]
        }, 
        this.players={
            "North":null,
            "East":null,
            "South":null,
            "West":null
        }, 
        this.turnStatus= {
            start: null, 
            board:[], 
            trumpBroken:false
        }, 
        this.scoreboard= {
            "North":0,
            "East":0,
            "South":0,
            "West":0
        }
    };

    getTurn(turn) {
        return ["North", "East", "South", "West"][turn%4];
    }
      
    getAction(roomState, io, userRoom, callbackUpdate) {
        switch(roomState.status){
            case "bid":
                roomState.turns ++;
                let selectedBid = this.getBid(roomState); //TO DO: Add AI ALGO
                this.selectBid(roomState, selectedBid);
                callbackUpdate(roomState);
                break
            case "selectPartner":
                this.playerHands = roomState.playerHands;
                let validPartnerCards = this.getValidPartnerCards(); 
                let selectedPartnerCard = this.getPartnerCard(roomState, validPartnerCards); //TO DO: Add AI ALGO
                this.selectPartnerCard(roomState, io, userRoom, selectedPartnerCard)
                callbackUpdate(roomState);
                break
            case "play":
                this.playerHands = roomState.playerHands;
                let validCards = this.getValidCards(roomState);
                let selectedPlayCard = this.getPlayCard(roomState, validCards); //TO DO: Add AI ALGO
                this.selectPlayCard(roomState, io, userRoom, selectedPlayCard, ()=>callbackUpdate(roomState));
                break
            default:
                console.log('Error: Unidentified status for AI')
        }
    }

    getBid(roomState) {
        // TO DO: ADD AI ALGO 
        //Sample
        if (roomState.bid <2){
            return roomState.bid +1;
        }else{
            return "pass";
        }
    }

    selectBid(roomState, selectedBid) {
        if (selectedBid !== "pass"){
            roomState.bid = selectedBid;
            roomState.bidlog.push({bid:selectedBid, userID:this.name, userRole:this.role});
            roomState.pass = 0;
            roomState.bidWinner.userID = this.name;
            roomState.bidWinner.userRole = this.role;
        }else{
            roomState.bidlog.push({bid:"pass", userID:this.name, userRole:this.role});
            roomState.pass ++;
        }
    }

    getPartnerCard(roomState, validPartnerCards){
        //TO DO: ADD AI ALGO
        //Sample
        return validPartnerCards.cards[0]
    }

    selectPartnerCard(roomState, io, userRoom, card){
        // Search through all four players hand to find who holds the partner card
        for (let player of ["North","East","South","West"]){
            // For each player, search through all 13 cards in hand
            for (let i = 0; i < 13; i++){
                if (Number(roomState.playerHands[player][i].id) === Number(card.id)){
                    roomState.bidWinner.partner.suite = card.suite;
                    roomState.bidWinner.partner.val = card.val-2;
                    roomState.bidWinner.partner.role = player;
                    roomState.status = "play";
                    console.log("AI partner is ", player, card.suite, card.val, roomState.bidWinner.partner);
                    io.to(userRoom).emit('receivedMsg', {username: "Admin", message: roomState.bidWinner.userRole + " has chosen partner: "+ ["2","3","4","5","6","7","8","9","10","Jack","Queen","King","Ace"][roomState.bidWinner.partner.val] + " of" + {c:" Club", d:" Diamond", h:" Heart", s:" Spade"}[roomState.bidWinner.partner.suite] })
                    if (roomState.bidWinner.trump !== 4) {roomState.turns++;};
                    return ;
                }
            }
        }
    }

    getValidPartnerCards(){
        //console.log('player hands',this.playerHands[this.role]);
        let validPartnerCards = new Deck();

        // Loop backward so that splice from array wont cause reindexing issue
        for (let i = validPartnerCards.cards.length-1; i>=0; i--){
            if (this.checkValidPartnerCard(validPartnerCards.cards[i]) === false){
                console.log('invalid partner', validPartnerCards.cards[i])
                validPartnerCards.cards.splice(i,1);
            }
        }
        return validPartnerCards;
    }


    checkValidPartnerCard(card) {
        for (let i = 0; i < this.playerHands[this.role].length; i++) {
            if (Number(this.playerHands[this.role][i].id) === Number(card.id)){
                return false;
            }
        }
        return true;
    }

    getPlayCard(roomState, validCards){
        //TO DO: ADD AI ALGO
        //Sample
        return validCards[0];
    }

    selectPlayCard(roomState, io, userRoom, card, callbackFunction) {
        console.log(this.role + " played " + card.suite+ " "+ card.val);

        // Player cannot play twice in the same round. If caught, return
        if (roomState.checkPlayerPlayedBefore(this.role) === true){ return ;}
    
        // Broadcast to room chat if trump is broken
        if (roomState.turnStatus.trumpBroken === false && roomState.checkTrumpBrokenStatus(card.suite) === true){
            io.to(userRoom).emit('receivedMsg', {username: "Admin", message: "Trump is broken!"});
        }
    
        // If board is empty, set first card as starting suit
        if (roomState.turnStatus.board.length === 0){
            roomState.turnStatus.start = card.suite;
        }
    
        // Add card to board
        roomState.turnStatus.board.push({user: this.role, id:card.id,suite:card.suite,val:card.val});
    
        // Move Card Object from player hand to board
        roomState.updatePlayerHand(this.role, card.id);
    
        // If there are 4 or more cards on the board, we conclude and end the round
        if (roomState.turnStatus.board.length >= 4){
            // Disable all cards to prevent players from further playing any cards until next round starts
            roomState.disable = true;
            io.to(userRoom).emit('updateState', (roomState));

            // All the following updates will only take effect after timeout
            // Get winner of the round
            let winner = roomState.getWinner();
            console.log('winner', winner);
            // Set winner position to start the next round
            roomState.turns = ["North", "East", "South", "West"].indexOf(winner.user);
            // Add winner score by 1
            roomState.scoreboard[winner.user] ++;
            // Reset board state to empty
            roomState.turnStatus.board = [];
            // Reset starting card to null
            roomState.turnStatus.start = null;
            // Set disable back to false
            roomState.disable = false;

            setTimeout(()=>{
                callbackFunction();
            }, 1000);
        }
        else {
            // Round hasnt ended, increment turn by 1 and let next player play
            roomState.turns = (roomState.turns + 1)%4;
            callbackFunction();
        }
    }
    
    getValidCards(roomState) {
        let validCards = [];
        for (let i = 0; i < this.playerHands[this.role].length; i++) {
            if (this.checkValidCard(roomState, this.playerHands[this.role][i]) === true){
                validCards.push(this.playerHands[this.role][i]);
            }
        }
        return validCards
    }

    checkValidCard(roomState, card) {
        let boardScenario = this.getBoardAndCardStatus(roomState, card.suite);
        switch(boardScenario) {
            case 0: return true; //NO Trump game, board is EMPTY
            case 1: return true; //NO Trump game, board is NOT EMPTY, card suit matches board starting suit
            case 2: return !this.handHasBoardStartingSuit(roomState); //NO Trump game, board is NOT EMPTY, card suit does NOT match board starting suit. If hand contains other cards with board starting suit, player must follow board starting suit.
            case 3: return true; //Trump game, board is EMPTY, card suit is Trump suit, but Trump was broken
            case 4: return !this.handHasNonTrumpSuit(roomState); //Trump game, board is EMPTY, card suit is Trump suit, but Trump was NOT broken
            case 5: return true; //Trump game, board is EMPTY, card suit is NOT Trump suit
            case 6: return true; //Trump game, board is NOT EMPTY, card suit matches board starting suit
            case 7: return !this.handHasBoardStartingSuit(roomState); //Trump game, board is NOT EMPTY, card suit does NOT match board starting suit. If hand contains other cards with board starting suit, player must follow board starting suit.
            default: throw "Error: Undefined boardScenario encountered";
        }
    } 
    
    getBoardAndCardStatus(roomState, suite) {
        // if this is a NO Trump game
        if (roomState.bidWinner.trump === 4){
            // and board is EMPTY
            if (roomState.turnStatus.board.length === 0) return 0;
            // and board is NOT EMPTY, and card suit is the same as board starting suit
            else if (roomState.turnStatus.start === suite) return 1;
            // and board is NOT EMPTY, and card suit is different from board starting suit
            else { return 2; }
        }
        // if this is a Trump game and board is EMPTY
        else if (roomState.turnStatus.board.length === 0){
            // and card suit is trump suit
            if (["c","d","h","s"].indexOf(suite) === roomState.bidWinner.trump){
                // and trump was broken
                if (roomState.turnStatus.trumpBroken === true) return 3
                // and trump was NOT broken
                else { return 4; };
            }
            // and card is NOT a trump suit
            else return 5;
        }
        // if this is a Trump game and board is NOT EMPTY
        else {
            // and card matches board starting suit
            if (roomState.turnStatus.start === suite) return 6;
            // and card does NOT match board starting suit
            else { return 7; };
        }   
    }

    handHasBoardStartingSuit(roomState){
        let hand = this.playerHands[this.role];
        for (let i = 0; i < hand.length; i++) {
          if (hand[i].suite === roomState.turnStatus.start) return true; //hand contains card with board starting suit. 
        }
        return false; //hand ran out of board starting suit.
    }
    
    handHasNonTrumpSuit(roomState){
        let hand = this.playerHands[this.role];
        for (let i = 0; i < hand.length; i++) {
            if (["c","d","h","s"].indexOf(hand[i].suite) !== roomState.bidWinner.trump) return true; //hand contains non-trump suit
        }
        return false; //hand only have trump suit left
    }
}


module.exports = AI;