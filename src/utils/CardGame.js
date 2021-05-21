const utils = require('./utils');

class CardGame
{
    defaultCards = ['A', 9, 7, 4, 'Q', 2, 10, 'K', 3, 5, 8, 6, 'J'];
    cardsSign = ['coeur', 'carreau', 'pique', 'trefle'];
    cardsStack = [];

    constructor()
    {
        utils.shuffleArray(this.defaultCards);
        utils.shuffleArray(this.cardsSign);
        this.generateStackOfCards();
    }

    /**
     *  Génère la pile de carte
     *
     */
    generateStackOfCards = () =>
    {
        this.cardsStack = [];
        let cardId = 1;
        this.cardsSign.forEach((sign) =>
        {
            let color = sign === 'pique' || sign === 'trefle' ? 'noir' : 'rouge';

            this.defaultCards.forEach((card) =>
            {
                this.cardsStack.push({
                    id       : cardId++,
                    iconType : sign,
                    number   : typeof card === 'number' || card === 'A' ? card : null,
                    letters  : typeof card === 'string' && card !== 'A' ? card : null,
                    color    : color,
                    isFlipped: true,
                });
                utils.shuffleArray(this.cardsStack);
            });
        });
        return this.cardsStack;
    };

    /**
     * TODO: Vérifier les duplicate
     * @param numberOfCards
     * @param maxDuplicate
     */
    getCardForPlayer(numberOfCards = 4, maxDuplicate = 2)
    {
        /** Remélange du tas de carte */
        utils.shuffleArray(this.cardsStack);

        /**
         * Générer un tableau vide, tant que le tas du joueur n'a pas le nombre de carte souhaité on génère un nombre entre 0 et le nombre total de carte disponible
         * On ajoute la carte au tas du joueur et la supprime du tas du jeu.
         * @type {*[]}
         */
        let playersCard = [];
        while (playersCard.length !== (numberOfCards)) {
            let randomNumber = Math.floor(Math.random() * this.cardsStack.length);
            playersCard.push(this.cardsStack[randomNumber]);
            this.cardsStack.splice(randomNumber, 1);
        }
        return playersCard;
    }

    generateGame()
    {
        let ranks = [];
        let maxCard = 1;
        let tooMuchCard = false;
        if (this.cardsStack !== undefined) {
            while (this.cardsStack.length > 0) {
                if (maxCard > this.cardsStack.length) {
                    tooMuchCard = true;
                    break;
                }
                let rank = [];
                for (let cardNumber = 0; cardNumber < maxCard; cardNumber++) {
                    const randomCardNumber = Math.floor(Math.random() * this.cardsStack.length);
                    rank.push(this.cardsStack[randomCardNumber]);
                    this.cardsStack.splice(randomCardNumber, 1);
                }
                ranks.push(rank);
                maxCard++;
            }
            if (tooMuchCard) {
                let totalRanks = ranks.length;
                for (let curRank = totalRanks - 1; curRank > 1; curRank--) {
                    if (this.cardsStack.length === 0) {
                        break;
                    }
                    const randomCardNumber = Math.floor(Math.random() * this.cardsStack.length);
                    ranks[curRank].push(this.cardsStack[randomCardNumber]);
                    this.cardsStack.splice(randomCardNumber, 1);
                }
            }
            return ranks;
        }
    }
}

module.exports = CardGame;