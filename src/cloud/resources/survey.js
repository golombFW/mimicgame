exports.survey = function (userName, userId, submitUrl) {
    if (!submitUrl) {
        submitUrl = "https://mimicgamedev.parseapp.com/survey";
    }

    return {
        "title": "Mimic Game - ankieta 1",
        "tags": ["ankieta1", userId],
        "webhook_submit_url": submitUrl,
        "design_id": "S2WEqhUbbc",
        "fields": [
            {
                "type": "statement",
                "question": "Cześć " + userName + ". Mam do Ciebie kilka pytań. Za wypełenienie tej ankiety dostaniesz **1000 punktów**. Zalecane jest, by ją wypełnić już po rozegraniu przynajmniej jednej rozgrywki!"
            },
            {
                "type": "multiple_choice",
                "question": "Wybierz swoją płeć",
                "choices": [
                    {
                        "label": "Kobieta"
                    },
                    {
                        "label": "Mężczyzna"
                    }
                ],
                "tags": ["question1"],
                "required": true
            },
            {
                "type": "multiple_choice",
                "question": "Wybierz swój przedział wiekowy",
                "choices": [
                    {
                        "label": "mniej niż 15 lat"
                    },
                    {
                        "label": "15 do 18 lat"
                    },
                    {
                        "label": "19 do 24 lat"
                    },
                    {
                        "label": "25 do 30 lat"
                    },
                    {
                        "label": "31 do 45 lat"
                    },
                    {
                        "label": "46 do 60 lat"
                    },
                    {
                        "label": "więcej niż 60 lat"
                    }
                ],
                "tags": ["question2"],
                "required": true
            },
            {
                "type": "multiple_choice",
                "question": "Skąd dowiedziałaś/eś się o grze Mimic Game?",
                "choices": [
                    {
                        "label": "od autora aplikacji"
                    },
                    {
                        "label": "polecił mi ją znajomy"
                    },
                    {
                        "label": "zauważyłem na facebooku, że znajomy gra w nią"
                    },
                    {
                        "label": "znalazłem na facebooku"
                    }
                ],
                "add_other_choice": true,
                "tags": ["question3"],
                "required": true
            },
            {
                "type": "yes_no",
                "question": "Czy rozegrałaś/eś już jakąś rozgrywkę?",
                "ref": "yesno-did-you-play",
                "tags": ["question4"],
                "required": true
            },
            {
                "type": "multiple_choice",
                "question": "Ile rozgrywek już skończyłaś/eś?",
                "choices": [
                    {
                        "label": "jedną"
                    },
                    {
                        "label": "2 do 5"
                    },
                    {
                        "label": "6 do 10"
                    },
                    {
                        "label": "więcej niż 10"
                    }
                ],
                "tags": ["question5"],
                "required": true
            },
            {
                "type": "yes_no",
                "question": "Czy zagrasz jeszcze?",
                "tags": ["question6"],
                "required": true
            },
            {
                "type": "opinion_scale",
                "steps": 5,
                "labels": {
                    "left": "Zdecydowanie nie",
                    "center": "Nie mam zdania",
                    "right": "Zdecydowanie tak"
                },
                "question": "Czy podoba Ci się forma w jakiej została zrealizowana gra?",
                "start_at_one": true,
                "ref": "do-you-like-it",
                "tags": ["question7"],
                "required": true
            },
            {
                "type": "yes_no",
                "question": "Czy brałaś/eś kiedyś udział w badaniu lub grałaś/eś w podobną grę etc. która polega na udawaniu emocji?",
                "ref": "yesno-science",
                "tags": ["question8"],
                "required": true
            },
            {
                "type": "short_text",
                "question": "Co to było? Podaj nazwę i/lub krótko opisz.",
                "tags": ["question9"],
                "required": true
            },
            {
                "type": "opinion_scale",
                "steps": 5,
                "labels": {
                    "left": "Zdecydowanie nie",
                    "center": "Tak samo",
                    "right": "Zdecydowanie tak"
                },
                "question": "Czy podoba Ci się bardziej od gry/badania, o którym wspomniałaś/eś w poprzednim pytaniu?",
                "start_at_one": true,
                "tags": ["question10"],
                "required": true
            },
            {
                "type": "opinion_scale",
                "steps": 5,
                "labels": {
                    "left": "Nie czuję się z tym dobrze",
                    "center": "Neutralnie",
                    "right": "Bardzo dobrze, nie mam z tym problemu"
                },
                "question": "W skali 1-5, jak komfortowo czujesz się robiąc sobie, a potem wysyłając zdjęcia w tej grze?",
                "start_at_one": true,
                "ref": "i-feel-good",
                "tags": ["question11"],
                "required": true
            },
            {
                "type": "long_text",
                "question": "Twoje uwagi (pytanie otwarte)",
                "tags": ["question12"]
            }
        ],
        "logic_jumps": [
            {
                "from": "yesno-did-you-play",
                "to": "do-you-like-it",
                "if": false
            },
            {
                "from": "yesno-science",
                "to": "i-feel-good",
                "if": false
            }
        ]
    };
};