import { Scene } from "phaser";
import { ControlButtons } from "../gameObjs/controlButtons";
import { ControlButtonDisabler } from "../gameObjs/buttonDisabler";
import { SpamAds } from "../gameObjs/spamAds";

export class ObstacleTimer {
  private scene: Scene;
  private controlBtns: ControlButtons;
  private controlBtnDisabler: ControlButtonDisabler;
  private adsSpammer: SpamAds;

  private adSpawnTimer: Phaser.Time.TimerEvent | null = null;
  private flipControlBtnsTimer: Phaser.Time.TimerEvent | null = null;
  private disableTimer: Phaser.Time.TimerEvent | null = null;
  private reEnableTimer: Phaser.Time.TimerEvent | null = null;

  constructor(
    scene: Scene,
    controlBtns: ControlButtons,
    spamAds: SpamAds,
    buttonDisabler: ControlButtonDisabler,
  ) {
    this.scene = scene;
    this.controlBtns = controlBtns;
    this.controlBtnDisabler = buttonDisabler;
    this.adsSpammer = spamAds;
  }

  public startAll(): void {
    this.startAdSpawning();
    this.startFlipControlBtns();
    this.startButtonDisabling();
  }

  public stopAll(): void {
    this.stopAdSpawning();
    this.stopFlipControlBtns();
    this.stopButtonDisabling();
  }

  public setControlButtonDisabler(disabler: ControlButtonDisabler): void {
    this.controlBtnDisabler = disabler;
  }

  private startAdSpawning(
    baseProbability: number = 0.1,
    roundMultiplier: number = 0.03,
    maxProbability: number = 0.8,
  ) {
    // calculate the current probability based on the round number
    const currProbability = Math.min(
      ((baseProbability + this.scene.registry.get("round")) as number) * roundMultiplier,
      maxProbability,
    );

    const spawnAdsWithProbability = () => {
      const randomProb = Math.random();
      console.log("Spawning ads with probability", currProbability);
      console.log("Math.random()", randomProb);
      if (randomProb < currProbability) {
        this.adsSpammer.spawnAds();
      }
      // schedule the next ad spawn check after delay
      const delayMs = Phaser.Math.Between(2000, 4000);
      this.adSpawnTimer = this.scene.time.delayedCall(delayMs, spawnAdsWithProbability);
    };

    spawnAdsWithProbability();
  }

  public stopAdSpawning(): void {
    if (this.adSpawnTimer) {
      this.scene.time.removeEvent(this.adSpawnTimer);
      this.adSpawnTimer = null;
    }
  }

  public startFlipControlBtns(
    baseDurationMs: number = 4000,
    durationVarianceMs: number = 1000,
    initialDelayMs: number = 5000,
  ): void {
    this.scene.time.delayedCall(initialDelayMs, () => {
      const flipButtons = () => {
        this.controlBtns.flipAllBtns();

        const duration = baseDurationMs + Math.random() * durationVarianceMs;
        this.scene.time.delayedCall(duration, () => {
          this.controlBtns.unflipAllBtns();

          const nextFlipDelayMs = 5000 + Math.random() * 20000;
          this.flipControlBtnsTimer = this.scene.time.delayedCall(nextFlipDelayMs, flipButtons);
        });
      };
      flipButtons();
    });
  }

  public stopFlipControlBtns(): void {
    if (this.flipControlBtnsTimer) {
      this.scene.time.removeEvent(this.flipControlBtnsTimer);
      this.flipControlBtnsTimer = null;
    }
  }

  public startButtonDisabling(): void {
    this.stopButtonDisabling();
    this.scheduleNextDisable();
  }

  public stopButtonDisabling(): void {
    if (this.disableTimer) {
      this.disableTimer.destroy();
      this.disableTimer = null;
    }
    if (this.reEnableTimer) {
      this.reEnableTimer.destroy();
      this.reEnableTimer = null;
    }
  }

  private scheduleNextDisable(): void {
    const delay = this.controlBtnDisabler.calculateNextDisableDelay();

    this.disableTimer = this.scene.time.delayedCall(delay, () => {
      try {
        const { buttonIndex, reEnableDelay } = this.controlBtnDisabler.disableRandomCtrlBtn();

        this.reEnableTimer = this.scene.time.delayedCall(reEnableDelay, () => {
          this.controlBtnDisabler.reEnableCtrlBtn(buttonIndex);
          this.reEnableTimer = null;
          this.scheduleNextDisable();
        });
      } catch (error) {
        console.error("Error disabling button:", error);
        this.scene.time.delayedCall(5000, this.scheduleNextDisable, [], this);
      }
    });
  }
}
