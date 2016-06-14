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

exports.TurnType = TurnType;