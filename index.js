const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

console.log(canvas)
console.log(context)
console.log('X-cordinate: ',canvas.width)
console.log('Y-cordinate: ',canvas.height)



//* PLAYER CLASS
class Player {

    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw () {
        context.beginPath()
        context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        context.fillStyle = this.color
        context.fill()
    }
}
const x = canvas.width/2
const y = canvas.height/2
const player = new Player (x, y, 30, 'white')



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


//* ANIMATE-FUNCTION
function animate () {
    requestAnimationFrame(animate)
    context.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()
    // animate projectile
    projectiles.forEach( projectile => {
        projectile.update()
        projectile.draw()
    })
    // animate enemy
    enemies.forEach( enemy => {
        enemy.update()
        enemy.draw()
    })
}
animate()





//* EVENT-LISTENER
window.addEventListener('click', (e) => {
    //console.log(e)
    //* triangulate x,y cordinates
    const triangulate = Math.atan2(e.clientY - canvas.height/2, e.clientX - canvas.width /2)
    console.log('ANGLE: ', triangulate)
    //* angles
    const angles = {
        x: Math.cos(triangulate),
        y: Math.sin(triangulate)
    }
    const projectile = new Projectile(canvas.width/2, canvas.height/2, 5, 'red', angles )
    projectiles.push(projectile)
})



//* SPAWN-ENEMIES
function spawnEnemies () {
    setInterval(() => {
        console.log('spawning')
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = 50
        const color = 'green'
                                       // towards the middle minus starting point
        const triangulate = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
        const angles = {
            x: Math.cos(triangulate),
            y: Math.sin(triangulate)
        }
        enemies.push(new Enemy(x, y, radius, color, angles))
    }, 1000)
}
spawnEnemies()
