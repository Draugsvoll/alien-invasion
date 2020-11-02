import scoreboard from './scoreboard.js'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const startGameBtn = document.querySelector('.start-game-btn')
const modalEl = document.querySelector('.modal-container')
const modalScore = document.querySelector('.modal-score')
const scoreBox = document.querySelector(".scoreboard")
const displayPoints = document.querySelector(".points")
const resetBtn = document.querySelector(".reset")

const imgEnemyPath = 'enemy.png'
const imgPlayerPath = 'player.png'
const enemyObj = new Image()
const playerObj = new Image()

enemyObj.src = imgEnemyPath
playerObj.src = imgPlayerPath
context.drawImage(enemyObj, 10, 10)


// console.log(canvas)
// console.log(context)
//console.log('X-cordinate: ',canvas.width)
//console.log('Y-cordinate: ',canvas.height)



//* PLAYER CLASS
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw () {
        // context.beginPath()
        // context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        // context.fillStyle = this.color
        // context.fill()
        playerObj.style.background = 'rgba(0,0,0, 0.1)'
        context.drawImage(playerObj, this.x -35, this.y -35)
    }
}
const x = canvas.width/2
const y = canvas.height/2
const player = new Player (x, y, 20, 'white')


//* ENEMEY CLASS
class Enemy {
    constructor ( x, y, radius, color, angles) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.angles = angles
    }

    draw () {
        // context.beginPath()
        // context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        // context.fillStyle = this.color
        // context.fill()
        enemyObj.style.background = 'rgba(0,0,0, 0.1)'
        context.drawImage(enemyObj, this.x, this.y)
    }

    update() {
        this.x = this.x + this.angles.x
        this.y = this.y + this.angles.y
    }
}


//* PARTICLE CLASS
const friction = 0.98
class Particle {
    constructor ( x, y, radius, color, angles) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.angles = angles
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


//* ANIMATE FUNCTION
let animationId
function animate () {
    animationId = requestAnimationFrame(animate)
    context.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()
    // animate crash particles
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
        enemy.draw()

        // end game
        const dist = Math.hypot( player.x - enemy.x, player.y - enemy.y)
        if ( dist - enemy.radius - player.radius < 1 ) {
            window.cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            let endScore = scoreBox.innerHTML.split(' ')
            modalScore.innerHTML = endScore[1]
            displayPoints.innerHTML = "Points"
            startGameBtn.innerHTML = "Restart"
        }
        // collision detection
        projectiles.forEach( (projectile, projectileIndex) => {
            const dist = Math.hypot( projectile.x - enemy.x, projectile.y - enemy.y)
            // has collided
            if ( dist - enemy.radius - projectile.radius < 1) {
                // create smaller particles a at crash
                for ( let i=0; i<enemy.radius; i++) {
                    particles.push( new Particle(projectile.x, projectile.y, 3, enemy.color, { x: (Math.random() - 0.5)*6, y: (Math.random() - 0.5) *6 }) )
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
    const projectile = new Projectile(canvas.width/2, canvas.height/2, 8, 'white', angles )
    projectiles.push(projectile)
})



//* SPAWN ENEMIES
function spawnEnemies () {
    setInterval( () => {
        const radius = Math.random() * ( 60 - 15 ) + 15
        var x = Math.random()
        var y = Math.random() 
        let speed = Math.random() * 5 +1
       if ( Math.random() < 0.5 ) {
           x = Math.random() < 0.5 ? 0-radius : canvas.width+radius
           y = Math.random() * canvas.height
       } else {
           x = Math.random() * canvas.width
           y = Math.random() < 0.5 ? 0-radius : canvas.height + radius
       }
        const color = `hsl( ${Math.random() * 360}, 50%, 50%)`
                                       // towards the middle minus starting point
        const triangulate = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
        const angles = {
            x: Math.cos(triangulate) * speed,
            y: Math.sin(triangulate) * speed
        }
        enemies.push(new Enemy(x, y, 50, color, angles))
    }, 1300)
}



//* START GAME BUTTON
startGameBtn.addEventListener('click', () => {
    modalEl.style.display = 'none'
    // clear old game
    projectiles = []
    enemies = []
    scoreBox.innerHTML = 'Score: 0'
    resetBtn.innerHTML = 'reset'

    animate()
    spawnEnemies()
})

//* RESET BTN
resetBtn.addEventListener('click', () => {
    location.reload()
})