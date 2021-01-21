
    const LEFT_CUTOFF = window.innerWidth / 3
    const RIGHT_CUTOFF =  (window.innerWidth) - (window.innerWidth / 3)
    const UP_CUTOFF = window.innerHeight / 2
    const DOWN_CUTOFF = (window.innerHeight) - (window.innerHeight / 2)

    var barX = window.innerWidth/2 - 100
    var barY = window.innerHeight/2
    let bar = document.getElementById('bar')
    bar.style['left'] = barX + 'px'
    bar.style['bottom'] = barY + 'px'

    var globalX = window.innerWidth/2
    var globalY = -500

    window.saveDataAcrossSessions = true
    
    webgazer.setGazeListener(function(data, timestamp) {
        if (data == null) return;
        //* left
        if (data.x < window.innerWidth/2) {
                if (barX < 50) return
                barX -= 15
                bar.style["left"] = barX + 'px'
                console.log('LEFT')
        }
        //* middle
        if (data.x >= LEFT_CUTOFF && data.x <= RIGHT_CUTOFF ) {
            // do nothing
        }
        //* right
        if (data.x > window.innerWidth/2) {
            if (barX + 100 >= window.innerWidth) return
                barX += 15
                bar.style["left"] = barX + 'px'
                console.log('RIGHT')
        }
        //* up
        // if (data.y <= UP_CUTOFF) {
        //     if (barY+100 >= window.innerHeight) return
        //     barY += 15
        //     bar.style["bottom"] = barY + 'px'
        //     console.log('UP')
        // }
        //* down
        // if (data.y >= DOWN_CUTOFF) {
        //     if (barY - 10 <= 0) return
        //     barY -= 15
        //     bar.style["bottom"] = barY + 'px'
        //     console.log('DOWN')
        // }
        // console.log(barY)
        globalX = data.x
        globalY = data.y
    }).begin();
    
   
import scoreboard from './scoreboard.js'

//* CANVAS
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

//* DOM HOOKS
const normalGameBtn = document.querySelector('.start-normalgame-btn')
const hardGameBtn = document.querySelector('.start-hardgame-btn')
const modalEl = document.querySelector('.modal-container')
const modalScore = document.querySelector('.modal-score')
const scoreBox = document.querySelector(".scoreboard")
const displayPoints = document.querySelector(".points")
const resetBtn = document.querySelector(".reset")

//* IMAGES
const imgEnemyPath = 'assets/enemy.png'
const imgPlayerPath = 'assets/player.png'
const imgStarPath = 'assets/star.png'
const imgBossPath = 'assets/boss.png'
const enemyObj = new Image()
const playerObj = new Image()
const starObj = new Image()
const bossObj = new Image()
enemyObj.src = imgEnemyPath
playerObj.src = imgPlayerPath
starObj.src = imgStarPath
bossObj.src = imgBossPath

//* SOUNDS
var bossSound;
var gameMusic;
var bombSound
var gameOverSound
var gunfireSound
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.volume = 0.25
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.playDelay = function(){
        this.sound.currentTime = 2
        this.sound.play();
    }
    this.playDelayGun = function(){
        this.sound.currentTime = 0.450
        this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
      this.sound.currentTime = 0
    }
    this.mute = function() {
        this.sound.volume = 0
    }
  }
  bossSound = new sound("assets/bossIncoming.mp3");
  gameMusic = new sound("assets/music.mp3");
  bombSound = new sound("assets/bomb.mp3");
  gameOverSound = new sound("assets/gameOver.mp3");
  gunfireSound = new sound("assets/gunfire.mp3");




//* PLAYER CLASS
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw () {
        context.drawImage(playerObj, barX, -barY + 805)
    }
}
// const x = canvas.width/2
// const y = canvas.height/2
const x = globalX
const y = globalY
const player = new Player (x, -500, 15, 'white')


//* ENEMEY CLASS
class Enemy {
    constructor ( x, y, radius, angles, isBoss ) {
        this.x = x
        this.y = y
        this.radius = radius
        this.angles = angles
        this.isBoss = isBoss
    }
    draw () {
        context.drawImage(enemyObj, this.x, this.y)
    }
    drawBoss () {
        context.drawImage(bossObj, this.x-50, this.y-75)
    }
    update() {
        this.x = this.x + this.angles.x
        this.y = this.y + this.angles.y
    }
}


//* STARS
class Star {
    constructor (x) {
        this.x = x
        this.y = 0
    }
    draw() {
        context.drawImage(starObj, this.x, this.y)
    }
    update() {
        this.y += 25
    }
}


//* PARTICLE CLASS
const friction = 0.98
class Particle {
    constructor ( x, y, radius, angles ) {
        this.x = x
        this.y = y
        this.radius = radius
        this.angles = angles
        this.color = 'white'
        this.alpha = 1
    }
    draw () {
        context.save() // only affect this scope
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
        context.restore() // finish statement/code
    }
    update() {
        this.angles.x *= friction
        this.angles.y *= friction
        this.x = (this.x + this.angles.x) 
        this.y = (this.y + this.angles.y) 
        this.alpha -= 0.02
    }
}


//* PROJECTILE CLASS
class Projectile {
    constructor ( x, y, radius, color, angles) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.angles = angles
    }
    draw () {
        context.beginPath()
        context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }
    update() {
        this.x = this.x + this.angles.x
        this.y = this.y + this.angles.y
    }
}

var projectiles = [ ]
var enemies = [ ]
var particles = [ ]
var stars = [ ]
 

//* ANIMATE FUNCTION
let animationId
function animate () {
    animationId = requestAnimationFrame(animate)
    context.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()
    // draw stars
    stars.forEach( star => {
        star.update()
        star.draw()
    })

    // animate crashes
    particles.forEach( (particle, index) => {
        if ( particle.alpha <= 0.1 ) {
            particles.splice(index, 1)
        } else {
            particle.update()
            particle.draw() 
        }
    })

    // animate projectile
    // projectiles.forEach( (projectile, index) => {
    //     projectile.update()
    //     projectile.draw()
    //     // remove projectile if outside canvas
    //     if ( projectile.x + projectile.radius < 0 ||
    //          projectile.x - projectile.radius > canvas.width ||
    //          projectile.y + projectile.radius < 0 ||
    //          projectile.y - projectile.radius > canvas.height) {
    //          projectiles.splice( index, 1) 
    //          }
    // })

    // animate enemy
    enemies.forEach( (enemy, index) => {
        enemy.update()
        if ( enemy.isBoss === true) {
            enemy.drawBoss()
        } else {
            enemy.draw()
        }

        // check for end game
        // const dist = Math.hypot( player.x - enemy.x, player.y - (enemy.y+750))
        const dist = Math.hypot( barX - enemy.x, barY - enemy.y)
        // //* END GAME
        if ( dist - enemy.radius - player.radius < 1 ) {
            // reset stuff
            bossSound.stop()
            bossSound.mute()
            gameMusic.stop()
            bombSound.stop()
            gameOverSound.play()
            window.cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            let endScore = scoreBox.innerHTML.split(' ')
            modalScore.innerHTML = endScore[1]
            displayPoints.innerHTML = "Points"
            normalGameBtn.style.display = 'none'
            hardGameBtn.style.display = 'none'
            resetBtn.style.display = 'block'
        }

        // collision detection
        // projectiles.forEach( (projectile, projectileIndex) => {
        //     const dist = Math.hypot( projectile.x - enemy.x, projectile.y - enemy.y)
        //     // has collided
        //     if ( dist - enemy.radius - projectile.radius < 1) {
        //     if ( enemy.isBoss ) bossSound.stop(), bombSound.play(), setTimeout(() => {  bombSound.stop() }, 1000)
        //         // create crash particles
        //         for ( let i=0; i<10; i++) {
        //             particles.push( new Particle(projectile.x, projectile.y, 3, { x: (Math.random() - 0.5)*6, y: (Math.random() - 0.5) *6 }) )
        //         }
        //             setTimeout( () => {
        //                 enemies.splice( index, 1 )
        //                 projectiles.splice( projectileIndex, 1 )
        //                 scoreboard.updateScore()
        //             },0)
        //     }
        // })

    })
}



//* MOUSE CLICK LISTENER
// canvas.addEventListener('click', (e) => {
//     gunfireSound.stop()
//     gunfireSound.playDelayGun() 
//     setTimeout(() => {  gunfireSound.stop() }, 200);
//     // triangulate x,y cordinates
//     const triangulate = Math.atan2(e.clientY - canvas.height/2, e.clientX - canvas.width /2)
//     // angles
//     const angles = {
//         x: Math.cos(triangulate) * 30,
//         y: Math.sin(triangulate) * 30
//     }
//     const projectile = new Projectile(canvas.width/2, canvas.height/2, 6, 'white', angles )
//     projectiles.push(projectile)
// })


//* SPAWN STARS
function spawnStars () {
    setInterval( () => {
        const x = Math.random() * canvas.width
        stars.push(new Star(x) )
    }, 125)
        
}


//* SPAWN ENEMIES
var bossInterval
var spawnInterval
function spawnEnemies () {
    var enemyCount = 0
    setInterval( () => {
        enemyCount++
        var isBoss = false
        var radius = 55
        var x = Math.random()
        var y = Math.random() 
        var speed = Math.random() * 2 + 2
       if ( Math.random() < 0.5 ) {
           x = Math.random() < 0.5 ? 0-radius : canvas.width+radius
           y = Math.random() * canvas.height
       } else {
           x = Math.random() * canvas.width
           y = Math.random() < 0.5 ? 0-radius : canvas.height + radius
       }
                                       // towards the middle minus starting point
        const triangulate = Math.atan2(canvas.height/2 - y, 0)
        var angles = {
            x: Math.cos(triangulate) * speed,
            y: Math.sin(triangulate) * speed
        }
        var anglesBoss = {
            x: Math.cos(triangulate) * 9,
            y: Math.sin(triangulate) * 9
        }
        // animate boss after x-number of enemies
        if ( !(enemyCount % bossInterval) ) {
            bossSound.playDelay()
            isBoss = true
            radius = 70
            angles = anglesBoss
        }
        enemies.push(new Enemy(x, y, radius, angles, isBoss))
    }, spawnInterval)
}


//* INIT NEW GAME
function initGame () {
    modalEl.style.display = 'none'
    projectiles = []
    enemies = []
    scoreBox.innerHTML = 'Score: 0'
    animate()
    // spawnEnemies()
    spawnStars()
    // gameMusic.playDelay()
}

//* START NORMAL GAME 
normalGameBtn.addEventListener('click', () => {
    bossInterval = 5
    spawnInterval = 1500
   
    initGame()
})

//* START HARD GAME 
hardGameBtn.addEventListener('click', () => {
    bossInterval = 10
    spawnInterval = 500
    initGame()
})

//* BACK BTN
resetBtn.addEventListener('click', () => {
    location.reload()
})

