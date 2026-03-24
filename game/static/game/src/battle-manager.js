const socket = new WebSocket(`ws://${window.location.host}/ws/battle/${battleId}/`);
var comp1MatchScore, comp2MatchScore = 0;
var comp1SetScore, comp2SetScore = 0;
var comp1Times, comp2Times = [];
var scramble = currentScramble;

const updateScramble = (newScramble) => {
    const scrambleText = document.getElementById('scramble-text');
    const scrambleDisplay = document.getElementById('scramble-display');
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