import scoreboard from './scoreboard.js'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const normalGameBtn = document.querySelector('.start-normalgame-btn')
const hardGameBtn = document.querySelector('.start-hardgame-btn')
const modalEl = document.querySelector('.modal-container')
const modalScore = document.querySelector('.modal-score')
const scoreBox = document.querySelector(".scoreboard")
const displayPoints = document.querySelector(".points")
const resetBtn = document.querySelector(".reset")

const imgEnemyPath = 'assets/enemy.png'
const imgPlayerPath = 'assets/player.png'
const imgStarPath = 'assets/star.png'
const imgBossPath = 'assets/boss.png'
const enemyObj = new Image()
const playerObj = new Image()
const starObj = new Image()
const bossObj = new Image()

var bossSound;
var gameMusic;
var bombSound
var gunSound;
var killSound;
var gameOverSound;

enemyObj.src = imgEnemyPath
playerObj.src = imgPlayerPath
starObj.src = imgStarPath
bossObj.src = imgBossPath


// console.log(canvas)
// console.log(context)
//console.log('X-cordinate: ',canvas.width)
//console.log('Y-cordinate: ',canvas.height)




//* SOUNDS
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.volume = 0.2
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
    this.stop = function(){
      this.sound.pause();
      this.sound.currentTime = 0
    }
  }
  bossSound = new sound("assets/bossIncoming.mp3");
  gameMusic = new sound("assets/music.mp3");
  //menuMusic = new sound("assets/menuMusic.mp3");
  bombSound = new sound("assets/bomb.mp3");



//* PLAYER CLASS
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw () {
        context.drawImage(playerObj, this.x -66, this.y -55)
    }
}
const x = canvas.width/2
const y = canvas.height/2
const player = new Player (x, y, 50, 'white')


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
var boss = []


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
    projectiles.forEach( (projectile, index) => {
        projectile.update()
        projectile.draw()
        // remove projectile if outside canvas
        if ( projectile.x + projectile.radius < 0 ||
             projectile.x - projectile.radius > canvas.width ||
             projectile.y + projectile.radius < 0 ||
             projectile.y - projectile.radius > canvas.height) {
             projectiles.splice( index, 1) 
             }
    })
   
    // animate enemy
    enemies.forEach( (enemy, index) => {
        enemy.update()
        if ( enemy.isBoss === true) {
            enemy.drawBoss()
        } else {
            enemy.draw()
        }
        //* END GAME
        const dist = Math.hypot( player.x - enemy.x, player.y - enemy.y)
        if ( dist - enemy.radius - player.radius < 1 ) {
            // reset stuff
            gameMusic.stop()
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
        projectiles.forEach( (projectile, projectileIndex) => {
            const dist = Math.hypot( projectile.x - enemy.x, projectile.y - enemy.y)
            // has collided
            if ( dist - enemy.radius - projectile.radius < 1) {
            if ( enemy.isBoss ) bossSound.stop(), bombSound.play(), setTimeout(() => {  bombSound.stop() }, 1000)

                // create smaller particles at crash
                for ( let i=0; i<10; i++) {
                    particles.push( new Particle(projectile.x, projectile.y, 3, { x: (Math.random() - 0.5)*6, y: (Math.random() - 0.5) *6 }) )
                }
                    setTimeout( () => {
                        enemies.splice( index, 1 )
                        projectiles.splice( projectileIndex, 1 )
                        scoreboard.updateScore()
                    },0)
                
            }
        })
    })
}





//* MOUSE CLICK LISTENER
canvas.addEventListener('click', (e) => {
    // triangulate x,y cordinates
    const triangulate = Math.atan2(e.clientY - canvas.height/2, e.clientX - canvas.width /2)
    // angles
    const angles = {
        x: Math.cos(triangulate) * 30,
        y: Math.sin(triangulate) * 30
    }
    const projectile = new Projectile(canvas.width/2, canvas.height/2, 6, 'white', angles )
    projectiles.push(projectile)
})



//* SPAWN STARS
function spawnStars () {
    setInterval( () => {
        const x = Math.random() * canvas.width
        stars.push(new Star(x) )
    }, 125)
        
}


var bossInterval
var spawnInterval
//* SPAWN ENEMIES
function spawnEnemies () {
    var enemyCount = 0
    setInterval( () => {
        enemyCount++
        var isBoss = false
        var radius = 55
        var x = Math.random()
        var y = Math.random() 
        var speed = Math.random() * 4.5 + 1.5
       if ( Math.random() < 0.5 ) {
           x = Math.random() < 0.5 ? 0-radius : canvas.width+radius
           y = Math.random() * canvas.height
       } else {
           x = Math.random() * canvas.width
           y = Math.random() < 0.5 ? 0-radius : canvas.height + radius
       }
                                       // towards the middle minus starting point
        const triangulate = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
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



 





//* START NORMAL GAME 
normalGameBtn.addEventListener('click', () => {
    bossInterval = 5
    spawnInterval = 1000
    modalEl.style.display = 'none'
    // clear old game
    projectiles = []
    enemies = []
    scoreBox.innerHTML = 'Score: 0'
    animate()
    spawnEnemies()
    spawnStars()

    gameMusic.playDelay()
//menuMusic.play()


})

//* START HARD GAME 
hardGameBtn.addEventListener('click', () => {
    bossInterval = 10
    spawnInterval = 500
    modalEl.style.display = 'none'
    // clear old game
    projectiles = []
    enemies = []
    scoreBox.innerHTML = 'Score: 0'
    animate()
    spawnEnemies()
    spawnStars()

    gameMusic.playDelay()
})


//* BACK BTN
resetBtn.addEventListener('click', () => {
    location.reload()
})

