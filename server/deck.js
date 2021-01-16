const Card = require('./card');

class Deck {
    constructor(){
        let deck = [];
        let cardID = 0;

        for (let suite of ["c", "d", "h", "s"]){
            for (let i = 2; i < 15; i++){
                deck.push(new Card(cardID, suite, i));
                cardID ++;
            }
        }
        this.cards = deck;
    }


    shuffle() {
        let currentIndex = this.cards.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = this.cards[currentIndex];
          this.cards[currentIndex] = this.cards[randomIndex];
          this.cards[randomIndex] = temporaryValue;
        }
        return this.cards;
      }
    
    deal(playerHands) {

        for (let [index, player] of Object.keys(playerHands).entries()){
            for (let i = 0; i < this.cards.length/4; i++){
                playerHands[player].push(this.cards[i+index*this.cards.length/4]);
            }
            playerHands[player].sort(
                function(a, b) {          
                   if (a.suite === b.suite) {
                      return a.val - b.val;
                   }
                   return a.suite > b.suite ? 1 : -1;
                });
        }
        return playerHands;
      }
}




module.exports = Deck;