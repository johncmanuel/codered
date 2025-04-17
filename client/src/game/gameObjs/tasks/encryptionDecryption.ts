import { Task } from "./task";
import { Scene } from "phaser";

export class EncryptionDecryption extends Task {
  private questions: { question: string; answer: number; options: number[] }[];
  private currentQuestionIndex: number = 0;
  private maxFails: number = 2;
  private fails: number = 0;
  private questionText: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Text[] = [];
  private correctSound: Phaser.Sound.BaseSound;
  private incorrectSound: Phaser.Sound.BaseSound;
  private box: Phaser.GameObjects.Rectangle;
  private boxText: Phaser.GameObjects.Text;
  private doc: Phaser.GameObjects.Image;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.createBlockingOverlay();
    this.questions = this.generateQuestions();
  }

  async preload(): Promise<void> {
    return new Promise((resolve) => {
      if (this.scene.textures.exists("doc")) {
        resolve();
        return;
      }
      this.scene.load.image("doc", "/assets/document.png");
      this.scene.load.on("complete", () => {
        console.log("Doc icon loaded successfully");
        resolve();
      });
      this.scene.load.audio("correct", "/assets/correctsoundeffect.mp3");
      this.scene.load.audio("incorrect", "/assets/wrongsoundeffect.mp3");
      this.scene.load.start();
    });
  }

  async start(): Promise<void> {
    console.log("Starting ENCRYPTION_DECRYPTION task");
    await this.preload();

    this.displayQuestion();
    this.box = this.scene.add
      .rectangle(10, 18, this.scene.cameras.main.width - 20, 40, 0x65e305)
      .setOrigin(0, 0)
      .setDepth(0);
    this.boxText = this.scene.add
      .text(620, 38, "", {
        fontFamily: "AudioWide",
        fontSize: "34px",
        color: "#FE0000",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(0);
    this.updateProgressText();

    this.doc = this.scene.add.image(635, 180, "doc").setOrigin(0.5, 0.5).setScale(0.3).setDepth(0);
  }

  private updateProgressText() {
    this.boxText.setText(
      `FILES HAVE BEEN EXPOSED! ENCRYPT ${this.currentQuestionIndex + 1}/${this.questions.length} FILES`,
    );
  }

  update() {}

  cleanup() {
    super.cleanup();
    this.box.destroy();
    this.boxText.destroy();
    this.doc.destroy();
    if (this.questionText) this.questionText.destroy();
    this.optionButtons.forEach((button) => button.destroy());
  }

  private generateQuestions() {
    const questions = [];

    const a1 = Phaser.Math.Between(1, 10);
    const b1 = Phaser.Math.Between(1, 10);
    questions.push({
      question: `${a1} + ${b1}`,
      answer: a1 + b1,
      options: this.generateOptions(a1 + b1, 4),
    });

    const a2 = Phaser.Math.Between(5, 15);
    const b2 = Phaser.Math.Between(1, a2);
    questions.push({
      question: `${a2} - ${b2}`,
      answer: a2 - b2,
      options: this.generateOptions(a2 - b2, 4),
    });

    const a3 = Phaser.Math.Between(1, 6);
    const b3 = Phaser.Math.Between(1, 6);
    questions.push({
      question: `${a3} * ${b3}`,
      answer: a3 * b3,
      options: this.generateOptions(a3 * b3, 4),
    });

    const b4 = Phaser.Math.Between(1, 5);
    const answer4 = Phaser.Math.Between(1, 5);
    const a4 = b4 * answer4;
    questions.push({
      question: `${a4} / ${b4}`,
      answer: answer4,
      options: this.generateOptions(answer4, 4),
    });

    const randomOp = Phaser.Math.Between(0, 3);
    switch (randomOp) {
      case 0: // addition
        const a5 = Phaser.Math.Between(1, 10);
        const b5 = Phaser.Math.Between(1, 10);
        questions.push({
          question: `${a5} + ${b5}?`,
          answer: a5 + b5,
          options: this.generateOptions(a5 + b5, 4),
        });
        break;
      case 1: // subtraction
        const a6 = Phaser.Math.Between(5, 15);
        const b6 = Phaser.Math.Between(1, a6);
        questions.push({
          question: `${a6} - ${b6}`,
          answer: a6 - b6,
          options: this.generateOptions(a6 - b6, 4),
        });
        break;
      case 2: // multiplication
        const a7 = Phaser.Math.Between(1, 6);
        const b7 = Phaser.Math.Between(1, 6);
        questions.push({
          question: `${a7} * ${b7}`,
          answer: a7 * b7,
          options: this.generateOptions(a7 * b7, 4),
        });
        break;
      case 3: // division
        const b8 = Phaser.Math.Between(1, 5);
        const answer8 = Phaser.Math.Between(1, 5);
        const a8 = b8 * answer8;
        questions.push({
          question: `${a8} / ${b8}`,
          answer: answer8,
          options: this.generateOptions(answer8, 4),
        });
        break;
    }
    return Phaser.Utils.Array.Shuffle(questions);
  }

  private generateOptions(correctAnswer: number, count: number): number[] {
    const options = [correctAnswer];

    while (options.length < count) {
      let option;
      do {
        const offset = Phaser.Math.Between(1, 3) * (Phaser.Math.Between(0, 1) ? 1 : -1);
        option = correctAnswer + offset;
      } while (option <= 0 || options.includes(option));

      options.push(option);
    }
    return Phaser.Utils.Array.Shuffle(options);
  }

  private displayQuestion() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
    console.log("currentQuestion.answer: ", currentQuestion.answer);

    this.questionText = this.scene.add
      .text(this.scene.cameras.main.centerX - 5, 300, currentQuestion.question, {
        fontFamily: "AudioWide",
        fontSize: "34px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5, 0.5);

    // Display the answer options in a 2x2 grid
    const startX = this.scene.cameras.main.centerX - 100; // center the grid horizontally
    const startY = 400;
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
          fontFamily: "AudioWide",
          fontSize: "24px",
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
    this.correctSound = this.scene.sound.add("correct");
    this.incorrectSound = this.scene.sound.add("incorrect");

    if (selectedAnswer === currentQuestion.answer) {
      console.log("Correct answer!");
      this.correctSound.play();
    } else {
      this.fails++;
      console.log("Incorrect answer!");
      this.incorrectSound.play();
    }

    this.currentQuestionIndex++;
    this.updateProgressText();

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
