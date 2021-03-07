const Deck = require('./deck');

class AI {
    /**
     * Creates an AI object that can bid, select partner, and play card.
     */
    constructor(name, room, role) {
        this.name = name;
        this.room = room;
        this.role = role;
        this.type = "AI";
    };

    /**
     * Convert turn (int between 0, 4) to string
     * @param {Number} turn 
     * @return {string}
     */
    getTurn(turn) {
        return ["North", "East", "South", "West"][turn%4];
    }
      
    /**
     * Get the action of the AI depending on the game status (ie bid, selectPartner, play)
     * @param {Room} roomState 
     * @param {Socket} io 
     * @param {string} userRoom 
     * @param {function} callbackUpdate 
     */
    getAction(roomState, io, userRoom, updateStateCallback, callbackUpdate) {

        switch(roomState.status){
            case "bid":
                roomState.turns ++;
                let selectedBid = this.getBid(roomState); //TO DO: Add AI ALGO
                this.selectBid(roomState, selectedBid);
                roomState.handleConsecutivePasses();
                callbackUpdate(roomState);
                break;
            case "selectPartner":
                let validPartnerCards = this.getValidPartnerCards(); 
                let selectedPartnerCard = this.getPartnerCard(roomState, validPartnerCards); //TO DO: Add AI ALGO
                this.selectPartnerCard(roomState, io, userRoom, selectedPartnerCard)
                callbackUpdate(roomState);
                break;
            case "play":
                let validCards = this.getValidCards(roomState);
                if (validCards.length<=0) {return;};
                let selectedPlayCard = this.getPlayCard(roomState, validCards); //TO DO: Add AI ALGO
                this.selectPlayCard(roomState, io, userRoom, selectedPlayCard, updateStateCallback,()=>callbackUpdate(roomState));
                break;
            case "gameOver":
                console.log("AI: Game over");
                break;
            default:
                console.log('Error: Unidentified status for AI')
        }
    }

    /**
     * TO DO: AI action - decide what to bid
     * @param {Room} roomState 
     * @return {string/Number}
     */
    getBid(roomState) {
        // TO DO: ADD AI ALGO 
        //Sample
        if (Number(roomState.bid) <10){
            console.log(roomState.bid)
            return Number(roomState.bid) +1;
        }else{
            return "pass";
        }
    }

    /**
     * Update room state with AI selected bid 
     * @param {Room} roomState 
     * @param {Number} selectedBid 
     */
    selectBid(roomState, selectedBid) {
        if (selectedBid !== "pass"){
            roomState.bid = selectedBid;
            roomState.playerBids[this.role].push(selectedBid);
            roomState.bidlog.push({bid:selectedBid, userID:this.name, userRole:this.role});
            roomState.pass = 0;
            roomState.bidWinner.userID = this.name;
            roomState.bidWinner.userRole = this.role;
        }else{
            roomState.playerBids[this.role].push('pass');
            roomState.bidlog.push({bid:"pass", userID:this.name, userRole:this.role});
            roomState.pass ++;
        }
    }

    /**
     * TO DO: AI action - decide which partner to select
     * @param {Room} roomState 
     * @param {Deck} validPartnerCards
     * @return {Card} 
     */
    getPartnerCard(roomState, validPartnerCards){
        //TO DO: ADD AI ALGO
        //Sample
        return validPartnerCards.cards[0]
    }

    /**
     * Update room state with AI selected partner
     * @param {Room} roomState 
     * @param {Socket} io 
     * @param {string} userRoom 
     * @param {Card} card 
     */
    selectPartnerCard(roomState, io, userRoom, card){
        // Search through all four players hand to find who holds the partner card
        for (let player of ["North","East","South","West"]){
            // For each player, search through all 13 cards in hand
            for (let i = 0; i < 13; i++){
                if (Number(roomState.playerHands[player][i].id) === Number(card.id)){
                    roomState.bidWinner.partner.card = card;
                    //roomState.bidWinner.partner.val = card.val-2;
                    roomState.bidWinner.partner.role = player;
                    roomState.status = "play";
                    console.log("AI partner is ", player, card.suite, card.val, roomState.bidWinner.partner);
                    //io.to(userRoom).emit('receivedMsg', {username: "Admin", message: roomState.bidWinner.userRole + " has chosen partner: "+ ["2","3","4","5","6","7","8","9","10","Jack","Queen","King","Ace"][roomState.bidWinner.partner.val] + " of" + {c:" Club", d:" Diamond", h:" Heart", s:" Spade"}[roomState.bidWinner.partner.suite] })
                    if (roomState.bidWinner.trump !== 4) {roomState.turns++;};
                    return ;
                }
            }
        }
    }

    /**
     * Returns a Deck object which stores a list of valid cards that can be chosen as partner. Valid cards are defined as cards that are not in bidwinner hand.
     * @return {Deck} 
     */
    getValidPartnerCards(){
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

    /**
     * Check whether a specific Card object is valid to be chosen as partner. A card is valid if it is not in bidwinner hand.
     * @param {Card} card 
     * @return {boolean}
     */
    checkValidPartnerCard(card) {
        const hand = roomState.playerHands[this.role];
        for (let i = 0; i < hand.length; i++) {
            if (Number(hand[i].id) === Number(card.id)){
                return false;
            }
        }
        return true;
    }

    /**
     * TO DO: AI action - decide which card to play 
     * @param {Room} roomState 
     * @return {Array}
     */
    getPlayCard(roomState, validCards){
        //TO DO: ADD AI ALGO
        //Sample
        return validCards[0];
    }

    /**
     * Update room state with AI selected card to play
     * @param {Room} roomState 
     * @param {Socket} io 
     * @param {string} userRoom 
     * @param {Card} card 
     * @param {function} callbackFunction 
     */
    selectPlayCard(roomState, io, userRoom, card, updateStateCallback, callbackFunction) {
        console.log(this.role + " played " + card.suite+ " "+ card.val);

        // Player cannot play twice in the same round. If caught, return
        if (roomState.checkPlayerPlayedBefore(this.role) === true){ return ;}
        
        // Check and update trump broken status
        roomState.checkTrumpBrokenStatus(card.suite);
    
        // If board is empty, set first card as starting suit
        if (roomState.turnStatus.board.length === 0){
            roomState.turnStatus.start = card.suite;
        }
    
        // Add card to board
        roomState.turnStatus.board.push({user: this.role, id:card.id,suite:card.suite,val:card.val});
        if (roomState.bidWinner.partner.card.id === card.id){
            console.log("partner revealed")
            roomState.partnerRevealed = true;
            roomState.partner = this.role;
          }
        // Move Card Object from player hand to board
        roomState.updatePlayerHand(this.role, card.id);
    
        // If there are 4 or more cards on the board, we conclude and end the round
        if (roomState.turnStatus.board.length >= 4){
            // Disable all cards to prevent players from further playing any cards until next round starts
            roomState.disable = true;
            
            setTimeout(()=>{
                // Get winner of the round
                let winner = roomState.getWinner();
                console.log('winner', winner);
                roomState.turns = null;
                //io.to(userRoom).emit('updateState', (roomState));
                updateStateCallback(roomState);

                // Set winner position to start the next round
                roomState.turns = ["North", "East", "South", "West"].indexOf(winner.user);
                // Add winner score by 1
                roomState.scoreboard[winner.user] ++;
                roomState.prevBoard = roomState.turnStatus.board;
                // Reset board state to empty
                roomState.turnStatus.board = [];
                // Reset starting card to null
                roomState.turnStatus.start = null;
                // Set disable back to false
                roomState.disable = false;
                // All the following updates will only take effect after timeout
                if (roomState.checkGameOver() === true && roomState.status != 'gameOver'){roomState.status = "gameOver";}

                setTimeout(()=>{
                    callbackFunction();
                }, 3000);
            
            }, 1000);
        }
        else {
            // Round hasnt ended, increment turn by 1 and let next player play
            roomState.turns = (roomState.turns + 1)%4;
            callbackFunction();
        }
    }
    
    /**
     * Returns an array of Card Objects that are valid to be played. A Card is valid if it follows break trump rule, follow starting suit rule etc.
     * @param {Room} roomState 
     * @return {Array}
     */
    getValidCards(roomState) {
        const hand = roomState.playerHands[this.role]
        let validCards = [];
        for (let i = 0; i < hand.length; i++) {
            if (this.checkValidCard(roomState, hand[i]) === true){
                validCards.push(hand[i]);
            }
        }
        return validCards
    }

    /**
     * Check whether a card is valid to be played. A Card is valid if it follows break trump rule, follow starting suit rule etc.
     * @param {Room} roomState 
     * @param {Card} card 
     * @return {boolean}
     */
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
    
    /**
     * Returns a number between 0 to 7 to account for 8 different types of board and card status
     * @param {Room} roomState 
     * @param {Number} suite 
     * @return {Number}
     */
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

    /**
     * Check whether hand contains any card suit that is the same suit as the first card played on the board
     * @param {Room} roomState 
     * @return {boolean}
     */
    handHasBoardStartingSuit(roomState){
        const hand = roomState.playerHands[this.role];
        for (let i = 0; i < hand.length; i++) {
          if (hand[i].suite === roomState.turnStatus.start) return true; //hand contains card with board starting suit. 
        }
        return false; //hand ran out of board starting suit.
    }
    
    /**
     * Check whether hand contains any card suit that is not trump suit
     * @param {Room} roomState 
     * @return {boolean}
     */
    handHasNonTrumpSuit(roomState){
        const hand = roomState.playerHands[this.role];
        for (let i = 0; i < hand.length; i++) {
            if (["c","d","h","s"].indexOf(hand[i].suite) !== roomState.bidWinner.trump) return true; //hand contains non-trump suit
        }
        return false; //hand only have trump suit left
    }
}


module.exports = AI;