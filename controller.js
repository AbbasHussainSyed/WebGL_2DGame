// FileName:        controller.js
// Programmer:     Abbas Hussain Syed
// Date:           07/26/2024
// Purpose:        This file defines the code for our controller.
//                 The "controller" handles and responds to user triggered events.

/**
 * The GameController class handles the game logic and user interactions.
 * It manages the Model and View components and sets up the game loop.
 */
class GameController {
    /**
     * Constructor for the GameController class.
     * @param {Object} model - The game model.
     * @param {Object} view - The game view.
     */
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for user input.
     */
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Handles the keydown event.
     * @param {Object} event - The event object.
     */
    handleKeyDown(event) {
        this.model.handleKeyDown(event.key);
    }

    /**
     * Handles the keyup event.
     * @param {Object} event - The event object.
     */
    handleKeyUp(event) {
        this.model.handleKeyUp(event.key);
    }

    /**
     * Starts the game by initializing the model and starting the game loop.
     * Displays the game rules to the player.
     */
    startGame() {
        alert('Game rules: Collect all non-red triangles using the green triangle. Avoid red triangles. Use arrow keys to move and get started. The game ends after 1 minute.');

        this.model.initializeGame();
        this.startTime = Date.now();
        this.gameDuration = 1 * 60 * 1000; // 1 minute in milliseconds
        this.gameLoop();
    }

    /**
     * The main game loop. Updates the model and view, and checks for game state.
     */
    gameLoop() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.gameDuration - elapsedTime);
        this.view.displayTimer(remainingTime);

        if (remainingTime <= 0) {
            this.model.gameState = 'lost';
        }

        this.model.update();
        this.view.render(this.model.gameObjects);

        if (this.model.gameState === 'playing') {
            requestAnimationFrame(() => this.gameLoop());
        } else {
            this.endGame();
        }
    }

    /**
     * Ends the game and displays a message based on the game state.
     */
    endGame() {
        if (this.model.gameState === 'won') {
            alert('Congratulations! You won!');
        } else {
            alert('Game over! You lost.');
        }
    }
}