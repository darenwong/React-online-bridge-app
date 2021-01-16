class Room {
    constructor() {
        this.disable=false, 
        this.turns=0, 
        this.status="setup", 
        this.bid=0, 
        this.bidlog=[], 
        this.pass= 0, 
        this.ipass=0, 
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
        this.ipass = 0;
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
}

module.exports = Room;