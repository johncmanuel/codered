import { Task } from "./task";
import { Scene } from "phaser";

export class EncryptionDecryption extends Task {
  private questions: { question: string; answer: number; options: number[] }[];
  private currentQuestionIndex: number = 0;
  private maxFails: number = 2;
  private fails: number = 0;
  private questionText: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Text[] = [];

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.createBlockingOverlay();
    this.questions = this.generateQuestions();
  }

  start() {
    console.log("Starting ENCRYPTION_DECRYPTION task");
    this.displayQuestion();
  }

  update() {}

  cleanup() {
    super.cleanup();
    if (this.questionText) this.questionText.destroy();
    this.optionButtons.forEach((button) => button.destroy());
  }

  private generateQuestions() {
    return [
      { question: "What is 5 + 3?", answer: 8, options: [6, 7, 8, 9] },
      { question: "What is 10 - 4?", answer: 6, options: [5, 6, 7, 8] },
      { question: "What is 2 * 3?", answer: 6, options: [4, 5, 6, 7] },
      { question: "What is 12 / 3?", answer: 4, options: [3, 4, 5, 6] },
      { question: "What is 7 + 6?", answer: 13, options: [12, 13, 14, 15] },
    ];
  }

  private displayQuestion() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    console.log("currentQuestion.answer: ", currentQuestion.answer);

    this.questionText = this.scene.add
      .text(this.scene.cameras.main.centerX, 200, currentQuestion.question, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    // Display the answer options in a 2x2 grid
    const startX = this.scene.cameras.main.centerX - 100; // center the grid horizontally
    const startY = 300;
    const buttonWidth = 150;
    const buttonHeight = 50;
    const spacing = 20;

    currentQuestion.options.forEach((option, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;

      const x = startX + col * (buttonWidth + spacing);
      const y = startY + row * (buttonHeight + spacing);

      const button = this.scene.add
        .text(x, y, option.toString(), {
          fontSize: "20px",
          color: "#ffffff",
          backgroundColor: "#333333",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on("pointerdown", () => this.handleAnswer(option));

      this.optionButtons.push(button);
    });
  }

  private handleAnswer(selectedAnswer: number) {
    const currentQuestion = this.questions[this.currentQuestionIndex];

    if (selectedAnswer === currentQuestion.answer) {
      console.log("Correct answer!");
    } else {
      this.fails++;
      console.log("Incorrect answer!");
    }

    this.currentQuestionIndex++;

    if (this.fails >= this.maxFails) {
      // Player loses
      this.endGame(false);
    } else if (this.currentQuestionIndex >= this.questions.length) {
      // Player wins
      this.endGame(true);
    } else {
      this.questionText.destroy();
      this.optionButtons.forEach((button) => button.destroy());
      this.optionButtons = [];

      this.displayQuestion();
    }
  }

  private endGame(isWinner: boolean) {
    if (isWinner) {
      console.log("You win!");
      this.complete();
    } else {
      console.log("You lose!");
      this.fail();
    }
  }
}
