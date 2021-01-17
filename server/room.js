class Room {
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
                "val":null,
                "role":null
            }
        }, 
        this.partnerRole=null, 
        this.playerHands={
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
        this.winner=[]
    }

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
        this.winner = [];
    }

    updatePlayerList(userID){
        let userPlayAreaLocation = Object.keys(this.players).find(key => this.players[key] === userID);
        // If user was one of the players, remove him from player list 
        if (userPlayAreaLocation !== undefined) {
            this.players[userPlayAreaLocation] = null;
        };
    }

    updateSpectatorList(name, role){
        let index = this.spectators.indexOf(name);

        switch(role) {
            case "Spectator":
                // If user was not a spectator, add him to spectator list
                if (index < 0){
                    this.spectators.push(name);
                }
                break;       
            default:
                if (role !== null) {this.players[role] = name;}
                // If user was a spectator, remove him from spectator list
                if ( index > -1){
                    this.spectators.splice(index, 1);
                }
        }
    }

    setBid(selectedBid, userID, userRole){
        switch(selectedBid) {
            case "pass":
                this.bidlog.push({bid:"pass", userID:userID, userRole:userRole});
                selectedBid = this.bid;
                this.pass ++;
                break
            default:
                this.bid = selectedBid;
                this.bidlog.push({bid:this.bid, userID:userID, userRole:userRole});
                this.pass = 0;
                this.bidWinner.userID = userID;
                this.bidWinner.userRole = userRole;
        }
        return selectedBid
    }

    handleConsecutivePasses(selectedBid){
        /*
        2 cases of consecutive passes to be accounted for:
            1. This is the first round of bidding and all 4 players pass, thus restarting the game
            2. This is not the first round of bidding and there are 3 consecutive passes, thus concluding bidding round
        */
        if (this.pass === 4){
            this.status = "allPass";
        }
    
        else if (this.pass >= 3 && this.turns !== 3){
            this.bidWinner.winningBid = Math.floor((Number(selectedBid)+4)/5);
            this.bidWinner.trump = (Number(selectedBid)-1)%5;

            if (this.bidWinner.trump === 4){
                this.turns = ["North", "East", "South", "West"].indexOf(this.bidWinner.userRole)
            }
            else {
                this.turns = (["North", "East", "South", "West"].indexOf(this.bidWinner.userRole) + 3)%4;
            }
            this.status = "selectPartner";
        }
    }

    checkPlayerPlayedBefore(userRole) {
        for (let i=0; i<this.turnStatus.board.length; i++){
            if (this.turnStatus.board[i].user === userRole){
                return true;
            }
        }
        return false;
    }

    checkTrumpBrokenStatus(suite) {
        if (suite === ["c","d","h","s"][this.bidWinner.trump] && this.turnStatus.trumpBroken === false){
            this.turnStatus.trumpBroken = true;
        }
        return this.turnStatus.trumpBroken;
    }

    updatePlayerHand(userRole, id) {
        this.playerHands[userRole].forEach((card, index) => {
            if (id === card.id){
                this.playerHands[userRole].splice(index, 1);
            }
        });
    }

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
        return winner;
    }

    checkGameOver() {
        // Game is over if all 13 rounds have been played
        if (this.partnerRole !== null && this.allThirteenRoundsPlayed === true) {
            let score = 0;
            
            // Determine who are the winners and their score
            let finalWinner = this.getFinalWinner();
            switch(finalWinner) {
                case "BidWinner and Partner":
                    this.winner = [this.partnerRole, this.bidWinner.userRole];
                    score = this.getBidWinnerTeamScore();                    
                    break;

                case "Defenders":
                    this.winner = ["North", "East", "South", "West"].filter(role => role !== this.partnerRole && role !== this.bidWinner.userRole);
                    score = 13 - this.getBidWinnerTeamScore();
                    break;
            };

            if (this.status != 'gameOver') io.to(userRoom).emit('receivedMsg', {username: "Admin", message: this.winner[0] + " and " + this.winner[1] + " have won with " + score + " tricks! Click Restart to play again"});
            this.status = "gameOver";
        }
    }

    allThirteenRoundsPlayed() {
        return Object.values(this.scoreboard).reduce((a, b) => a + b) === 13;
    }

    getFinalWinner() {
        let finalWinner = null;

        // Bidwinner + Partner wins if they won more than 6 + the number of bids. Else, the defenders won 
        if (this.getBidWinnerTeamScore >= this.bidWinner.winningBid + 6) {
            finalWinner = "BidWinner and Partner"
        } else {
            finalWinner = "Defenders"
        }
        return finalWinner;
    }

    getBidWinnerTeamScore() {
        return this.scoreboard[this.partnerRole] + this.scoreboard[this.bidWinner.userRole];
    }
}

module.exports = Room;