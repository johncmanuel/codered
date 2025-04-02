import { ControlButtons } from "./controlButtons";

export class ControlButtonDisabler {
  private scene: Phaser.Scene;
  private controlBtns: ControlButtons;

  constructor(scene: Phaser.Scene, controlBtns: ControlButtons) {
    this.scene = scene;
    this.controlBtns = controlBtns;
  }

  public setControlButtons(controlBtns: ControlButtons) {
    this.controlBtns = controlBtns;
  }

  public calculateNextDisableDelay(): number {
    const baseDelayMs = Phaser.Math.Between(20000, 40000);
    const roundFactorMs = (this.scene.registry.get("round") as number) * 1000;
    return Phaser.Math.Clamp(baseDelayMs - roundFactorMs, 5000, 40000);
  }

  public disableRandomCtrlBtn(): { buttonIndex: number; reEnableDelay: number } {
    if (!this.controlBtns) {
      throw new Error("Control buttons is null");
    }

    const controlBtns = this.controlBtns.getButtons();
    if (controlBtns.length === 0) {
      throw new Error("No control buttons created");
    }

    const randomIdx = Math.floor(Math.random() * controlBtns.length);
    this.controlBtns.disableBtn(randomIdx);
    this.controlBtns.getButtons()[randomIdx].setAlpha(0.5);

    console.log(`Disabling control button at index ${randomIdx}:`, controlBtns[randomIdx].text);

    return {
      buttonIndex: randomIdx,
      reEnableDelay: 2000, // constant delay for re-enabling
    };
  }

  public reEnableCtrlBtn(index: number): void {
    if (!this.controlBtns) {
      throw new Error("Control buttons is null");
    }

    const buttons = this.controlBtns.getButtons();
    if (index < 0 || index >= buttons.length) {
      throw new Error("Invalid button index");
    }

    console.log(`Re-enabling control button at index ${index}:`, buttons[index].text);
    buttons[index].setAlpha(1);
    this.controlBtns.enableBtn(index);
  }
}
