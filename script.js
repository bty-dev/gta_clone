import { Player } from "./player.js";
import { Projectile } from "./projectile.js";
import { Enemy } from "./enemy.js";
import { distanceBetweenTwoPoints } from "./utilities.js";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const wastedElement = document.querySelector(".wasted");
const scoreElement = document.querySelector("#score");

let player;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let animationId;
let spawnIntervalId;
let countIntervalId;

const animate = () => {
    animationId = requestAnimationFrame(animate);
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter(particle => particle.alpha > 0);

    projectiles = projectiles.filter(projectileInsideWindow);
    enemies.forEach(enemy => checkHittingEnemy(enemy));
    enemies = enemies.filter(enemy => enemy.health > 0);

    const isGameOver = enemies.some(checkHittingPlayer);
    if (isGameOver) {
        wastedElement.style.display = "block";
        clearInterval(countIntervalId);
        clearInterval(spawnIntervalId);
        cancelAnimationFrame(animationId);
    }

    particles.forEach(particle => particle.update());
    projectiles.forEach(projectile => projectile.update());
    player.update();
    enemies.forEach(enemy => enemy.update());
}

const projectileInsideWindow = (projectile) => {
    return projectile.x + projectile.radius > 0 &&
    projectile.x - projectile.radius < canvas.width &&
    projectile.y + projectile.radius > 0 &&
    projectile.y - projectile.radius < canvas.height;
}

const removeProjectileByIndex = (index) => {
    projectiles.splice(index, 1);
}

const checkHittingPlayer = (enemy) => {
    const distance = distanceBetweenTwoPoints(player.x, player.y, enemy.x, enemy.y);
    return distance - enemy.radius - player.radius < 0;
}

const increaseScore = () => {
    score += 250;
    scoreElement.innerHTML = score;
}

const checkHittingEnemy = (enemy) => {
    projectiles.some((projectile, index) => {
        const distance = distanceBetweenTwoPoints(projectile.x, projectile.y, enemy.x, enemy.y);
        if (distance - enemy.radius - projectile.radius > 0) return false;

        removeProjectileByIndex(index);
        enemy.health--;

        if (enemy.health < 1) {
            increaseScore();
            enemy.createExplosion(particles);
        }

        return true;
    })
}


const init = () => {
    const movementLimits = {
        minX: 0,
        maxX: canvas.width,
        minY: 0,
        maxY: canvas.height,
    };
    
    player = new Player(canvas.width / 2, canvas.height / 2, context, movementLimits);
    addEventListener("click", createProjectile)
};

const createProjectile = (event) => {
    projectiles.push(
        new Projectile(
            player.x,
            player.y,
            event.clientX,
            event.clientY,
            context
        )
    );
}

const spawnEnemies = () => {
    let countOfSpawnEnemies = 1;

    countIntervalId = setInterval(() => countOfSpawnEnemies++, 30000);
    spawnIntervalId = setInterval(() => spawnCountEnemies(countOfSpawnEnemies), 1000);
    spawnCountEnemies(countOfSpawnEnemies);
}

const spawnCountEnemies = (count) => {
    for (let i = 0; i < count; i++) {
        enemies.push(new Enemy(canvas.width, canvas.height, context, player));
    }
}


const startGame = () => {
    init();
    animate();
    spawnEnemies();
};

startGame();