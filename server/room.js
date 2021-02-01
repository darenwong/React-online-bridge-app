class Room {
    /**
     * Creates a class that stores the room state as follows:
     * @param {boolean} disable When set to true, stops all players from playing any cards by making cards unclickable.
     * @param {Number} turns Tracks which player turn to move during bidding and playing phase.
     * @param {string} status Tracks current game phase. Possible values are: "setup", "start", "bid", "allPass", "selectPartner", "play", "gameOver".
     * @param {Number} bid Store the current bid.
     * @param {Array} bidlog Store all historical bid.
     * @param {Object} bidWinner Store details of user who won the bid, and details about the winning bid and partner.
     * @param {Object} playerHands Store Cards Object in each player hand.
     * @param {Object} players Hash table of role to player name.
     * @param {Array} spectators List of all spectators name.
     * @param {Number} clients Number of clients connected to the room.
     * @param {Object} turnStatus Tracks board status like cards played, trumpBroken status.
     * @param {Array} winner Store the names of the winners.
     * @param {Number} finalScore Store the number of tricks that winner has won.
     */
    constructor() {
        this.disable=false, 
        this.turns=0, 
        this.status="setup", 
        this.bid=0, 
        this.bidlog=[], 
        this.pass= 0, 
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
        this.playerBids ={
            "North":[],
            "East":[],
            "South":[],
            "West":[]
        };
        this.players={
            "North":null,
            "East":null,
            "South":null,
            "West":null
        }, 
        this.spectators= [], 
        this.clients=0, 
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
        }, 
        this.roundWinner=null,
        this.winner=[],
        this.finalScore=0
    }

    /**
     * A method to reset room state
     */
    restart() {
        this.turns = 0;
        this.status = "setup";
        this.bid = 0;
        this.bidlog = [];
        this.pass = 0;
        this.bidWinner = {
            userID:null, 
            userRole:null, 
            winningBid:null, 
            trump: null, 
            partner: {
                "suite":null,
                "val":null,
                "role":null
            }
        };
        this.playerHands ={
            "North":[],
            "East":[],
            "South":[],
            "West":[]
        };
        this.playerBids ={
            "North":[],
            "East":[],
            "South":[],
            "West":[]
        };
        this.turnStatus = {
            start: null, 
            board:[], 
            trumpBroken:false
        };
        this.scoreboard = {
            "North":0,
            "East":0,
            "South":0,
            "West":0};
        this.roundWinner=null;
        this.winner = [];
        this.finalScore = 0;
    }
    
    /**
     * Check if user is in room player list. If yes, remove user from list
     * @param {string} userID 
     */
    updatePlayerList(user){
        let userPlayAreaLocation = Object.keys(this.players).find(key => this.players[key] && this.players[key].name === user.name);
        // If user was one of the players, remove him from player list 
        if (userPlayAreaLocation !== undefined) {
            this.players[userPlayAreaLocation] = null;
        };
    }

    /**
     * Check if user is in room spectator list. If yes, remove user from list
     * @param {string} name 
     * @param {string} role 
     */
    updateSpectatorList(user){
        let index = this.spectators.indexOf(user.name);

        switch(user.role) {
            case "Spectator":
                // If user was not a spectator, add him to spectator list
                if (index < 0){
                    this.spectators.push(user.name);
                }
                break;       
            default:
                if (user.role !== null) {this.players[user.role] = user;}
                // If user was a spectator, remove him from spectator list
                if ( index > -1){
                    this.spectators.splice(index, 1);
                }
        }
    }

    /**
     * Update bid state and log
     * @param {Number} selectedBid 
     * @param {string} userID 
     * @param {string} userRole 
     * @return {Number} selectedBid
     */
    setBid(selectedBid, userID, userRole){
        switch(selectedBid) {
            case "pass":
                this.playerBids[userRole].push("pass");
                this.bidlog.push({bid:"pass", userID:userID, userRole:userRole});
                selectedBid = this.bid;
                this.pass ++;
                break
            default:
                this.bid = selectedBid;
                this.playerBids[userRole].push(this.bid);
                this.bidlog.push({bid:this.bid, userID:userID, userRole:userRole});
                this.pass = 0;
                this.bidWinner.userID = userID;
                this.bidWinner.userRole = userRole;
        }
        return selectedBid
    }

    /**
     * Handle ending bidding round after consecutive passes from users 
     * 2 cases of consecutive passes to be accounted for:
     * 1) This is the first round of bidding and all 4 players pass, thus restarting the game.
     * 2) This is not the first round of bidding and there are 3 consecutive passes, thus concluding bidding round.
     * @param {Number} selectedBid 
     */
    handleConsecutivePasses(selectedBid){
        if (this.pass === 4){
            this.status = "allPass";
        }
    
        else if (this.pass >= 3 && this.turns !== 3){
            this.bidWinner.winningBid = Math.floor((Number(selectedBid)+4)/5);
            this.bidWinner.trump = (Number(selectedBid)-1)%5;
            this.turns = ["North", "East", "South", "West"].indexOf(this.bidWinner.userRole)
            this.status = "selectPartner";
        }
    }

    /**
     * Safety check whether the same player has already played in the current round.
     * @param {string} userRole 
     * @return {boolean} true if player has played before
     */
    checkPlayerPlayedBefore(userRole) {
        for (let i=0; i<this.turnStatus.board.length; i++){
            if (this.turnStatus.board[i].user === userRole){
                return true;
            }
        }
        return false;
    }

    /**
     * If current card suit matches the Trump suit, set trumpBroken state to true.
     * @param {string} suite 
     * @return {boolean} trumpBroken state
     */
    checkTrumpBrokenStatus(suite) {
        if (suite === ["c","d","h","s"][this.bidWinner.trump]){
            this.turnStatus.trumpBroken = true;
        }
        return this.turnStatus.trumpBroken;
    }

    /**
     * Remove card with specified id from player hand.
     * @param {string} userRole 
     * @param {Number} id 
     */
    updatePlayerHand(userRole, id) {
        this.playerHands[userRole].forEach((card, index) => {
            if (id === card.id){
                this.playerHands[userRole].splice(index, 1);
            }
        });
    }

    /**
     * Used for playing phase only.
     * Determine who won the round.
     * @return {Card} The Card object that won the round
     */
    getWinner() {
        let winner;
        this.turnStatus.board.forEach((card, index) => {
            if (index === 0){
                // This is the starting card of the round, by default it is the winning card
                winner = card;
            }
            else if (card.suite === winner.suite && card.val > winner.val){
                // If the suit matches the current winning suit, but the card value is higher, this becomes the new winning card
                winner = card;
            }
            else if (card.suite === ["c","d","h","s"][this.bidWinner.trump] && this.turnStatus.trumpBroken){
                // If this card is from trump suit and trump is broken, consider the following
                if (winner.suite !== ["c","d","h","s"][this.bidWinner.trump]){
                    // If the current winning suit is not a trump suit, this becomes the new winning card
                    winner = card;
                }
                else if (card.val > winner.val){
                    // If the current winning suit is a trump suit, but it's card value is higher, this becomes the new winning card
                    winner = card;
                }
            }
        })
        this.roundWinner = winner
        return winner;
    }

    /**
     * Check whether game is over.
     * Game is defined as over when all 13 rounds have been played.
     * If game is over, update who are the winners and their combined score.
     * @return {boolen} true if game is over
     */
    checkGameOver() {
        if (this.bidWinner.partner.role !== null && this.allThirteenRoundsPlayed() === true) {
            // Determine who are the winners and their score
            let finalWinner = this.getFinalWinner();
            switch(finalWinner) {
                case "BidWinner and Partner":
                    this.winner = [this.bidWinner.partner.role, this.bidWinner.userRole];
                    this.finalScore = this.getBidWinnerTeamScore();                    
                    break;

                case "Defenders":
                    this.winner = ["North", "East", "South", "West"].filter(role => role !== this.bidWinner.partner.role && role !== this.bidWinner.userRole);
                    this.finalScore = this.getDefenderTeamScore();
                    break;
            };
            return true
        }
        return false
    }

    /**
     * Check if all 13 rounds have been played
     * @return {boolean} true if all 13 rounds have been played
     */
    allThirteenRoundsPlayed() {
        return Object.values(this.scoreboard).reduce((a, b) => a + b) === 13;
    }

    /**
     * Returns the final winning team members
     * @return {string} Name of final winners
     */
    getFinalWinner() {
        let finalWinner = null;
        // Bidwinner + Partner wins if they won more than 6 + the number of bids. Else, the defenders won 
        if (this.getBidWinnerTeamScore() >= this.bidWinner.winningBid + 6) {
            finalWinner = "BidWinner and Partner"
        } else {
            finalWinner = "Defenders"
        }
        return finalWinner;
    }

    /**
     * Returns the Bidwinner and Partner total score
     * @return {Number} Total score of Bidwineer and Partner
     */
    getBidWinnerTeamScore() {
        return this.scoreboard[this.bidWinner.partner.role] + this.scoreboard[this.bidWinner.userRole];
    }

    /**
     * Returns the Defender team total score
     * @return {Number} Total score of Defender team
     */    
    getDefenderTeamScore() {
        return 13 - this.getBidWinnerTeamScore();
    }
}

module.exports = Room;