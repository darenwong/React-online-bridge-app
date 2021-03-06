const Card = require('./card');

class Deck {
    /**
     * Creates a deck object that contains an array of 52 Card Object
     */
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

    /**
     * Shuffle all Card Objects stored in an array in Deck Object
     * @return {Array} A shuffled array of Card Objects
     */
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
    
    /**
     * Deal out Card Objects in Deck Object into all 4 players hand
     * @param {Object} playerHands An object with structure: {'North':[], 'East':[], 'South':[], 'West':[]} 
     * @return {Object} playerHands populated with dealt Card Objects
     */
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