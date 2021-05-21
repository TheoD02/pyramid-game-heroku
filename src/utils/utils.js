module.exports = {
    shuffleArray        : (arrayToShuffle) =>
    {
        for (let count = 0; count < 5; count++) {
            for (let i = arrayToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arrayToShuffle[i], arrayToShuffle[j]] = [arrayToShuffle[j], arrayToShuffle[i]];
            }
        }
        return arrayToShuffle;
    },
    generateRandomNumber: (min, max) =>
    {
        return Math.floor(Math.random() * max) + min;
    },
};
