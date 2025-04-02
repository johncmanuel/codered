import { Scene, GameObjects } from "phaser";

export class TimeLimitBar {
  private scene: Scene;
  private maxTimeSec: number;
  private remainingTimeSec: number;
  private bar: GameObjects.Graphics;
  private border: GameObjects.Graphics;
  private widthPx: number = 300;
  private heightPx: number = 20;
  private x: number = 100;
  private y: number = 50;
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

  constructor(scene: Phaser.Scene, maxTimeSec: number, onCompleteCallback?: () => void) {
    this.scene = scene;
    this.maxTimeSec = maxTimeSec;
    this.remainingTimeSec = maxTimeSec;
    if (onCompleteCallback) this.onCompleteCallback = onCompleteCallback;

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

    if (this.remainingTimeSec <= 0) {
      this.stopTimer();
      if (this.onCompleteCallback) this.onCompleteCallback();
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
    this.bar.destroy();
    this.border.destroy();
  }

  public getRemainingTime(): number {
    return this.remainingTimeSec;
  }
}
