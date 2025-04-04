import { Scene, GameObjects } from "phaser";

export interface TimeLimitBarConfig {
  scene: Scene;
  maxTimeSec: number;
  x?: number;
  y?: number;
  margin?: number;
  labelText?: string;
  onCompleteCallback?: (bar: TimeLimitBar) => void;
}

export class TimeLimitBar {
  private scene: Scene;
  private maxTimeSec: number;
  private remainingTimeSec: number;
  private bar: GameObjects.Graphics;
  private border: GameObjects.Graphics;
  private label: GameObjects.Text;

  private widthPx: number = 300;
  private heightPx: number = 20;

  // want to position the bar below the task or top right
  // for now, use top right
  private marginFromScreenEdgesPx: number = 30;
  private x: number;
  private y: number;

  private updateEvent: Phaser.Time.TimerEvent;
  private onCompleteCallback: () => void;

  private redColor: number = 0xff0000;
  private yellowColor: number = 0xffff00;
  private greenColor: number = 0x00ff00;

  private timerDelayMs: number = 100;

  // used to track when last update occurred
  // this solves the issue of time being paused when the tab is not focused
  private lastUpdateTime: number = 0;

  private isRunning: boolean = false;

  constructor(options: TimeLimitBarConfig) {
    this.scene = options.scene;
    this.maxTimeSec = options.maxTimeSec;
    this.remainingTimeSec = options.maxTimeSec;
    this.x =
      options.x ??
      (this.scene.game.config.width as number) - this.widthPx - this.marginFromScreenEdgesPx;
    this.y = options.y ?? this.marginFromScreenEdgesPx;

    // wrapper for callback func
    this.onCompleteCallback = () => {
      if (options.onCompleteCallback) options.onCompleteCallback(this);
      console.log("callback called");
      // anything else if needed once timer is finished
      //
      // it should be explicitly destroyed rather as soon as it's done
      // this.destroy();
    };

    const labelX = this.x + this.widthPx / 2;
    const labelY = this.y - 15;
    const labelText = options.labelText || "Time Left";

    this.label = this.scene.add
      .text(labelX, labelY, labelText, {
        font: "12px Arial",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.label.setInteractive();
    this.label.on("pointerover", () => this.label.setAlpha(0.8));
    this.label.on("pointerout", () => this.label.setAlpha(1));

    this.border = this.scene.add.graphics();
    this.border.fillStyle(0x000000, 1);
    this.border.fillRect(this.x, this.y, this.widthPx, this.heightPx);

    this.bar = this.scene.add.graphics();
    this.updateBar();
  }

  public startTimer(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastUpdateTime = performance.now();

    this.updateEvent = this.scene.time.addEvent({
      delay: this.timerDelayMs,
      callback: this.updateTime,
      callbackScope: this,
      loop: true,
    });
  }

  private updateTime(): void {
    const now = performance.now();
    const elapsedSec = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    this.remainingTimeSec -= elapsedSec;
    this.updateBar();
    this.label.setText(`Time Limit: ${this.remainingTimeSec.toFixed(1)}s`);

    if (this.remainingTimeSec <= 0) {
      this.stopTimer();
      this.onCompleteCallback();
    }
  }

  private stopTimer(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.updateEvent) {
      this.updateEvent.destroy();
    }
  }

  private updateBar(): void {
    // clear previous drawings
    this.bar.clear();

    // calculate width based on remaining time
    const percentage = Math.max(0, this.remainingTimeSec / this.maxTimeSec);
    const fillWidth = this.widthPx * percentage;

    // color changes based on remaining time left
    let color = this.greenColor;
    if (percentage < 0.5) {
      color = this.yellowColor;
    }
    if (percentage < 0.2) {
      color = this.redColor;
    }

    this.bar.fillStyle(color, 1);
    this.bar.fillRect(this.x, this.y, fillWidth, this.heightPx);
  }

  public addTime(seconds: number): void {
    this.remainingTimeSec = Math.min(this.maxTimeSec, this.remainingTimeSec + seconds);
    this.updateBar();
  }

  public reduceTime(seconds: number): void {
    this.remainingTimeSec = Math.max(0, this.remainingTimeSec - seconds);
    this.updateBar();
  }

  public reset(): void {
    this.stopTimer();
    this.remainingTimeSec = this.maxTimeSec;
    this.updateBar();
    this.startTimer();
  }

  public pause(): void {
    this.stopTimer();
  }

  public resume(): void {
    this.startTimer();
  }

  public destroy(): void {
    this.stopTimer();
    if (this.bar) {
      this.bar.destroy();
      // this.bar = null;
    }

    if (this.border) {
      this.border.destroy();
      // this.border = null;
    }
    if (this.label) {
      this.label.destroy();
    }
    // console.log(this.bar, this.border);
  }

  public getRemainingTime(): number {
    return this.remainingTimeSec;
  }
}
