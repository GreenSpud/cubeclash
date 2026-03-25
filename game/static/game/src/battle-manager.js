let scrambleText;
let scrambleDisplay;
let timerText;
let competitorNumber;
let comp1MatchScore, comp2MatchScore = 0;
let comp1SetScore, comp2SetScore = 0;
let comp1Times, comp2Times = [];
let scramble;
let inspectionTime = 16.00;
let penalty;

const updateScramble = (newScramble) => {
    scrambleText.innerHTML = newScramble;
    scrambleDisplay.setAttribute('scramble', newScramble);
}

const handleBattleEvent = (message) => {
    switch (message.detail) {
        case 'competitor_joined':
            if (message.competitor_number === 2 && competitorNumber === 1) {
                window.location.reload();
            }
            break;
        case 'score_update':
            break;
        case 'scramble':
            scramble = message.scramble;
            updateScramble(scramble);
            break;
        case 'end_set':
            break;
        case 'end_match':
            break;
    }
}

const inspectionCountdown = () => {
    inspectionTime -= 0.01;

    if (inspectionTime < 1) {
        if (inspectionTime > -1) {
            penalty = "+2";
        } else {
            penalty = "DNF";
        }
        timerText.innerHTML = penalty;
    } else {
        timerText.innerHTML = inspectionTime | 0;
    }
}

window.onload = () => {
    const battleId = JSON.parse(document.getElementById('battleId').textContent);
    const socket = new WebSocket(`ws://${window.location.host}/ws/battle/${battleId}/`);
    const actionHintText = document.getElementById('timer-action-hint-text');

    scramble = JSON.parse(document.getElementById('currentScramble').textContent);
    competitorNumber = JSON.parse(document.getElementById('competitorNumber').textContent)
    scrambleText = document.getElementById('scramble-text');
    scrambleDisplay = document.getElementById('scramble-display');
    timerText = document.getElementById('timer-text');

    socket.onopen = () => socket.send(
        JSON.stringify({
            'event': 'battle.join',
            'message': {
                'competitor_number': competitorNumber,
            },
        })
    );

    socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        handleBattleEvent(JSON.parse(data.message));
    }

    document.addEventListener('keydown', (e) => {
        const keyInput = e.code;

        if (keyInput === 'Space') {
            timerText.classList.add('timer-text-ready');
        }
    })

    document.addEventListener('keyup', (e) => {
        const keyInput = e.code;

        if (keyInput === 'Space') {
            timerText.classList.remove('timer-text-ready');
            timerText.classList.add('timer-text-inspection');
            if (inspectionTime === 16.00) {
                actionHintText.innerHTML = "Inspecting";
                setInterval(inspectionCountdown, 10);
            }
        }
    })
}