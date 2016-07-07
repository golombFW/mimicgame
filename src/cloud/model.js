var TurnType = {
    RANDOM_QUESTION: {
        name: "Random_Question",
        photo_p1: "random_const",
        photo_p2: "random_const"
    },
    PHOTO_QUESTION: {
        name: "Photo_Question",
        photo_p1: "opponent",
        photo_p2: "opponent",
        phases: {
            initial: "initial",
            answer: "answer"
        }
    }
};

exports.GameType = {
    DEFAULT: {
        name: "DEFAULT",
        turns: [TurnType.PHOTO_QUESTION, TurnType.RANDOM_QUESTION, TurnType.RANDOM_QUESTION, TurnType.PHOTO_QUESTION, TurnType.PHOTO_QUESTION]
    },
    SINGLE: {
        name: "SINGLE",
        turns: [TurnType.RANDOM_QUESTION, TurnType.RANDOM_QUESTION, TurnType.RANDOM_QUESTION, TurnType.RANDOM_QUESTION]
    }
};

exports.GameplayDataStatus = {
    SUMMARY: "SUMMARY",
    WAITING: "WAITING",
    TURN: "TURN"
};

exports.GameplayData = {
    status: "",
    turn: {
        type: {},
        ordinal: 0,
        question: {},
        additionalData: {}
    },
    opponentLastAnswer: {}
};

exports.emotions = ["strach", "radość", "wstręt", "złość", "smutek", "zdziwienie"];

exports.photoPrivacy = {
    ALL_USERS: "ALL_USERS",
    FRIENDS: "FRIENDS",
    NONE: "NONE"
};

exports.DefaultRankRules = [
    {
        name: "correctAnswerAward",
        value: "100",
        type: "points"
    },
    {
        name: "allCorrectAnswersAward",
        value: "200",
        type: "points"
    },
    {
        name: "matchWinBonus",
        value: "1.5",
        type: "multiplier"
    },
    {
        name: "matchLostBonus",
        value: "0.5",
        value2: "-100",
        type: "multiplier",
        type2: "points"
    },
    {
        name: "matchRandomBonus",
        value: "100",
        value2: "0.2",
        type: "points",
        type2: "other"
    },
    {
        name: "initialPlayerRank",
        value: "500",
        type: "points"
    }
];

exports.TurnType = TurnType;