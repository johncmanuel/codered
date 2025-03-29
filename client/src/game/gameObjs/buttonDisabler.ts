import { ControlButtons } from "./controlButtons";

export class ControlButtonDisabler {
  private scene: Phaser.Scene;
  private controlBtns: ControlButtons;
  private disableButtonEvent: Phaser.Time.TimerEvent | null = null;
  private reEnableButtonEvent: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, controlBtns: ControlButtons) {
    this.scene = scene;
    this.controlBtns = controlBtns;
  }

  public setControlButtons(controlBtns: ControlButtons) {
    this.controlBtns = controlBtns;
  }

  public start() {
    this.scheduleRandomBtnDisable();
  }

  public stop() {
    if (!this.disableButtonEvent) return;
    if (!this.reEnableButtonEvent) return;
    this.disableButtonEvent.destroy();
    this.disableButtonEvent = null;
    this.reEnableButtonEvent.destroy();
    this.reEnableButtonEvent = null;
  }

  private scheduleRandomBtnDisable() {
    const baseDelayMs = Phaser.Math.Between(20000, 40000);
    // reduce delay by 1 second per round
    // this dynamically changes the delay based on the round number
    const roundFactorMs = (this.scene.registry.get("round") as number) * 1000;
    // clamp between 5-40 seconds
    const delayMs = Phaser.Math.Clamp(baseDelayMs - roundFactorMs, 5000, 40000);

    this.disableButtonEvent = this.scene.time.delayedCall(delayMs, () => {
      this.disableRandomCtrlBtn();
      this.scheduleRandomBtnDisable();
    });
  }

  disableRandomCtrlBtn() {
    if (!this.controlBtns) {
      console.error("Control buttons is null");
      return;
    }
    const controlBtns = this.controlBtns.getButtons();
    if (controlBtns.length === 0) {
      console.error("No control buttons created");
      return;
    }
    const randomIdx = Math.floor(Math.random() * controlBtns.length);
    this.controlBtns.disableBtn(randomIdx);
    // can play a sound or show a visual effect here to indicate the button is disabled
    // for now ima just change the alpha value of the button
    this.controlBtns.getButtons()[randomIdx].setAlpha(0.5);

    console.log(`Disabling control button at index ${randomIdx}:`, controlBtns[randomIdx].text);

    // then re-enable after random short delay
    const reEnableDelayMs = 2000;
    this.reEnableButtonEvent = this.scene.time.delayedCall(reEnableDelayMs, () => {
      // can play a sound or show a visual effect here to indicate the button is re-enabled
      console.log(`Re-enabling control button at index ${randomIdx}:`, controlBtns[randomIdx].text);
      this.controlBtns.getButtons()[randomIdx].setAlpha(1);
      this.controlBtns.enableBtn(randomIdx);
    });
  }
}
