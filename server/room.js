

let room = {        
            disable:false, 
            turns:0, 
            status:"setup", 
            bid:0, 
            bidlog:[], 
            pass: 0, 
            ipass:0, 
            bidWinner:{
                userID:null, 
                userRole:null, 
                winningBid:null, 
                trump: null, 
                partner: {
                    "val":null,
                    "role":null
                }
            }, 
            partnerRole:null, 
            playerHands:{
                "North":[],
                "East":[],
                "South":[],
                "West":[]
            }, 
            players:{
                "North":null,
                "East":null,
                "South":null,
                "West":null
            }, 
            spectators: [], 
            clients:0, 
            turnStatus: {
                start: null, 
                board:[], 
                trumpBroken:false
            }, 
            scoreboard: {
                "North":0,
                "East":0,
                "South":0,
                "West":0
            }, 
            winner: []
        }


module.exports = room;