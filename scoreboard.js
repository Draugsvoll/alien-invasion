var scoreboard = document.querySelector(".scoreboard")
var score = 0

scoreboard.innerHTML = 'Score: ' + score

function updateScore () {
    score += 10
    scoreboard.innerHTML = 'Score: ' + score
}

export default {
    scoreboard,
    updateScore
}