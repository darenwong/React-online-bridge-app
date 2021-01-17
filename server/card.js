class Card {
    /**
     * Creates a Card Object with following attributes:
     * @param {Number} id 
     * @param {string} suite 
     * @param {Number} val 
     */
    constructor(id, suite, val) {
        this.id = id;
        this.suite = suite;
        this.val = val;
    }
}


module.exports = Card;