let scrambleText;
let scrambleDisplay;
let timerText;
let actionHintText;
let solveNoLabel;
let competitorNumber;
let comp1MatchScore, comp2MatchScore = 0;
let comp1SetScore, comp2SetScore = 0;
let comp1Times = [];
let comp2Times = [];
let scramble;
let inspecting = false;
let timing = false;
let inspectionTime = 16.0;
let time = 0.0;
let penalty;

const updateScramble = (newScramble) => {
    scrambleText.innerHTML = newScramble;
    scrambleDisplay.setAttribute('scramble', newScramble);
}

const getResultText = (result) => {
    let suffix = "";

    if (penalty > 0) {
        suffix = "+"
    } else if (penalty === -1) {
        return "DNF";
    } else if (penalty === -2) {
        return "DNS";
    }

    if (time < 60) {
        return result.toFixed(2).padStart(1, '0') + suffix;
    } else {
        const minutes = String(Math.floor(time / 60)).padStart(1, '0');
        const seconds = (result % 60).toFixed(1).padStart(4, '0');
        return minutes + ':' + seconds + suffix;
    }
}

const updateScoresHTML = () => {
    const resultsTable = document.getElementById('results-table');
    const userSetScoreLabel = document.getElementById('user-set-score');
    const opponentSetScoreLabel = document.getElementById('opponent-set-score');
    let tableContent = document.getElementById('results-table-headings').innerHTML;

    if (competitorNumber === 1) {
        userSetScoreLabel.innerHTML = comp1SetScore;
        opponentSetScoreLabel.innerHTML = comp2SetScore;
        for (let i = 0; i < comp1Times.length; i++) {
            tableContent += `<tr></tr><td>${i + 1}</td><td>${comp1Times[i]}</td><td>${comp2Times[i]}</td></tr>`;
        }
    } else {
        userSetScoreLabel.innerHTML = comp2SetScore;
        opponentSetScoreLabel.innerHTML = comp1SetScore;
        for (let i = 0; i < comp1Times.length; i++) {
            tableContent += `<tr></tr><td>${i + 1}</td><td>${comp2Times[i]}</td><td>${comp1Times[i]}</td></tr>`;
        }
    }

    resultsTable.innerHTML = tableContent;
    resultsTable.style = `tr:nth-child(even) {
        background-color: #403939;
    }`;
}

const handleBattleEvent = (message) => {
    switch (message.detail) {
        case 'competitor_joined':
            if (message.competitor_number === 2 && competitorNumber === 1) {
                window.location.reload();
            }
            break;
        case 'score_update':
            comp1Times.push(getResultText(message.competitor_1_latest_result));
            comp2Times.push(getResultText(message.competitor_2_latest_result));
            comp1SetScore = message.competitor_1_score;
            comp2SetScore = message.competitor_2_score;
            updateScoresHTML();
            break;
        case 'scramble':
            scramble = message.scramble;
            updateScramble(scramble);
            timing = false;
            inspectionTime = 16.0;
            time = 0.0;
            actionHintText.innerHTML = "Space bar to begin inspection";
            solveNoLabel.innerHTML = "Solve " + (comp1Times.length + 1);
            break;
        case 'end_set':
            break;
        case 'end_match':
            break;
    }
}

const inspectionCountdown = () => {
    if (!inspecting) return;

    inspectionTime -= 0.01;

    if (inspectionTime < 1) {
        if (inspectionTime > -1) {
            penalty = 2;
            timerText.innerHTML = "+2";
        } else {
            penalty = -1;
            timerText.innerHTML = "DNF";
        }
    } else {
        timerText.innerHTML = inspectionTime | 0;
    }
}

const timer = () => {
    if (!timing) return;

    time += 0.01;
    if (time < 60) {
        timerText.innerHTML = time.toFixed(1).padStart(1, '0');
    } else {
        const minutes = String(Math.floor(time / 60)).padStart(1, '0');
        const seconds = (time % 60).toFixed(1).padStart(4, '0');
        timerText.innerHTML = minutes + ':' + seconds;
    }
}

window.onload = () => {
    const battleId = JSON.parse(document.getElementById('battleId').textContent);
    const socket = new WebSocket(`ws://${window.location.host}/ws/battle/${battleId}/`);
    scramble = JSON.parse(document.getElementById('currentScramble').textContent);
    competitorNumber = JSON.parse(document.getElementById('competitorNumber').textContent)
    scrambleText = document.getElementById('scramble-text');
    scrambleDisplay = document.getElementById('scramble-display');
    timerText = document.getElementById('timer-text');
    actionHintText = document.getElementById('timer-action-hint-text');
    solveNoLabel = document.getElementById('solve-number-text');


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
            if (time > 0 && timing) {
                timing = false;

                time = penalty > 0 ? time + penalty : time;
                timerText.innerHTML = getResultText(time);

                clearInterval(timer);
                actionHintText.innerHTML = "Waiting for opponent";

                socket.send(
                    JSON.stringify({
                        'event': 'battle.submit',
                        'message': {
                            'competitor_number': competitorNumber,
                            'time': penalty < 0? penalty : time.toFixed(2),
                        }
                    })
                );
            } else if (!timing) {
                timerText.classList.remove('timer-text-inspection');
                timerText.classList.add('timer-text-ready');
            }
        }
    })

    document.addEventListener('keyup', (e) => {
        const keyInput = e.code;

        if (keyInput === 'Space') {
            if (inspectionTime === 16) {
                inspecting = true;
                timerText.classList.remove('timer-text-ready');
                timerText.classList.add('timer-text-inspection');
                actionHintText.innerHTML = "Inspecting";
                setInterval(inspectionCountdown, 10);
            } else if (time === 0) {
                inspecting = false;
                timing = true;
                timerText.classList.remove('timer-text-ready');
                timerText.classList.remove('timer-text-inspection');
                actionHintText.innerHTML = "Timing";
                clearInterval(inspectionCountdown);
                setInterval(timer, 10);
            }
        }
    })
}