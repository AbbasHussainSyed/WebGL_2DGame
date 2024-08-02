// FileName:        model.js
// Programmer:     Abbas Hussain Syed
// Date:           07/26/2024
// Purpose:        This file defines the code for our WebGL 2 model.
//                 The "model" is all of the WebGL2 code that draws our graphics scene.

/**
 * The GameModel class handles the game logic and manages the game state.
 */
class GameModel {
    /**
     * Constructor for the GameModel class.
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     */
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.gameObjects = [];
        this.gameState = 'playing';
        this.score = 0;
        this.colors = [
            [1, 0, 0, 1],    // Red
            [0, 1, 0, 1],    // Green
            [0, 0, 1, 1],    // Blue
            [1, 1, 0, 1],    // Yellow
            [1, 0, 1, 1],    // Magenta
            [0, 1, 1, 1]     // Cyan
        ];
        this.keys = {};
        this.player = null;
        this.createGameObjects();
    }

    /**
     * Initializes the game by setting the game state and score,
     * and creating the game objects.
     */
    initializeGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.createGameObjects();
    }

    /**
     * Creates the game objects (triangles) with random positions and colors.
     */
    createGameObjects() {
        this.gameObjects = [];
        const size = 0.1; // Fixed size for all triangles
        const padding = size; // Padding to keep triangles within canvas bounds

        // Ensure there are at least 3 red triangles
        for (let i = 0; i < 3; i++) {
            let x = Math.random() * (2 - 2 * padding) - (1 - padding); // Random x position within bounds
            let y = Math.random() * (2 - 2 * padding) - (1 - padding); // Random y position within bounds
            this.gameObjects.push(new Triangle(x, y, size, [1, 0, 0, 1]));
        }

        // Create the remaining triangles
        for (let i = 3; i < 10; i++) {
            let x = Math.random() * (2 - 2 * padding) - (1 - padding); // Random x position within bounds
            let y = Math.random() * (2 - 2 * padding) - (1 - padding); // Random y position within bounds
            let color = this.colors[Math.floor(Math.random() * this.colors.length)];
            // Ensure no more red triangles are created
            while (color[0] === 1 && color[1] === 0 && color[2] === 0) {
                color = this.colors[Math.floor(Math.random() * (this.colors.length - 1)) + 1];
            }
            this.gameObjects.push(new Triangle(x, y, size, color));
        }

        // Ensure the player is the first object and is green
        this.player = this.gameObjects[0];
        this.player.color = [0, 1, 0, 1];
    }

    /**
     * Updates the game state by updating the player position,
     * all game objects, checking collisions, and game over conditions.
     */
    update() {
        this.updatePlayer();
        for (let obj of this.gameObjects) {
            obj.update();
        }
        this.checkCollisions();
        this.checkGameOver();
    }

    /**
     * Updates the player position based on the keys pressed.
     */
    updatePlayer() {
        const size = this.player.size;
        if (this.keys['ArrowUp'] && this.player.y < 1 - size) this.player.y += 0.01;
        if (this.keys['ArrowDown'] && this.player.y > -1 + size) this.player.y -= 0.01;
        if (this.keys['ArrowLeft'] && this.player.x > -1 + size) this.player.x -= 0.01;
        if (this.keys['ArrowRight'] && this.player.x < 1 - size) this.player.x += 0.01;
    }

    /**
     * Handles the keydown event and updates the keys object.
     * @param {string} key - The key that was pressed.
     */
    handleKeyDown(key) {
        this.keys[key] = true;
    }

    /**
     * Handles the keyup event and updates the keys object.
     * @param {string} key - The key that was released.
     */
    handleKeyUp(key) {
        this.keys[key] = false;
    }

    /**
     * Checks for collisions between the player and other game objects.
     */
    checkCollisions() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            for (let j = i + 1; j < this.gameObjects.length; j++) {
                if (this.isColliding(this.gameObjects[i], this.gameObjects[j])) {
                    this.handleCollision(this.gameObjects[i], this.gameObjects[j]);
                }
            }
        }
    }

    /**
     * Determines if two triangles are colliding.
     * @param {Object} triangle1 - The first triangle.
     * @param {Object} triangle2 - The second triangle.
     * @returns {boolean} - True if the triangles are colliding, false otherwise.
     */
    isColliding(triangle1, triangle2) {
        const dx = triangle1.x - triangle2.x;
        const dy = triangle1.y - triangle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const size = Math.sqrt(3) / 2 * triangle1.size;
        return distance < size;
    }

    /**
     * Handles the collision between the player and another triangle.
     * @param {Object} triangle1 - The first triangle.
     * @param {Object} triangle2 - The second triangle.
     */
    handleCollision(triangle1, triangle2) {
        if (triangle1 === this.player || triangle2 === this.player) {
            const otherTriangle = triangle1 === this.player ? triangle2 : triangle1;
            if (otherTriangle.color[0] === 1 && otherTriangle.color[1] === 0 && otherTriangle.color[2] === 0) { // Red triangle
                this.gameState = 'lost';
                return;
            }
            this.score += 10;
            const index = this.gameObjects.indexOf(otherTriangle);
            if (index > -1) {
                this.gameObjects.splice(index, 1);
            }
        }
    }

    /**
     * Checks if the game is over by determining if only the player and red triangles are left.
     */
    checkGameOver() {
        // Check if only player and red triangles are left
        const nonRedTriangles = this.gameObjects.filter(obj => !(obj.color[0] === 1 && obj.color[1] === 0 && obj.color[2] === 0));
        if (nonRedTriangles.length === 1) { // Only player is left
            this.gameState = 'won';
        }
    }
}

/**
 * The GameObject class represents a generic game object.
 */
class GameObject {
    /**
     * Constructor for the GameObject class.
     * @param {number} x - The x position of the game object.
     * @param {number} y - The y position of the game object.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Update method for the GameObject class.
     * This method can be overridden by subclasses to provide specific update logic.
     */
    update() {}
}

/**
 * The Triangle class represents a triangle game object.
 * It extends the GameObject class.
 */
class Triangle extends GameObject {
    /**
     * Constructor for the Triangle class.
     * @param {number} x - The x position of the triangle.
     * @param {number} y - The y position of the triangle.
     * @param {number} size - The size of the triangle.
     * @param {Array} color - The color of the triangle in RGBA format.
     */
    constructor(x, y, size, color) {
        super(x, y);
        this.size = size;
        this.color = color;
    }

    /**
     * Update method for the Triangle class.
     * This method can be overridden to provide specific update logic for the triangle.
     */
    update() {}
}