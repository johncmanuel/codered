import { Task } from "./task";
import { Scene } from "phaser";

export class PhishingEmail extends Task {
  private emails: {
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    isPhishing: boolean;
  }[];
  // prevent duplicate emails from being seen
  private emailsSeen: Set<number> = new Set();
  private score: number = 0;
  private maxScore: number = 2;
  private maxFails: number = 2;
  private fails: number = 0;
  private emailText: Phaser.GameObjects.Text;
  private phishingButton: Phaser.GameObjects.Text;
  private safeButton: Phaser.GameObjects.Text;

  constructor(scene: Scene, taskId: string) {
    super(scene, taskId);
    this.createBlockingOverlay();
    this.emails = this.generateEmails();
  }

  start() {
    console.log("Starting PHISHING_EMAIL task");

    this.displayEmail();
  }

  update() {}

  cleanup() {
    super.cleanup();
    if (this.emailText) this.emailText.destroy();
    if (this.phishingButton) this.phishingButton.destroy();
    if (this.safeButton) this.safeButton.destroy();
  }

  private generateEmails() {
    const playerRecipient = "randomemployee@therandomcompany.com";
    return [
      {
        sender: "support@bank.com",
        recipient: playerRecipient,
        subject: "Urgent: Your Account Has Been Compromised",
        body: "Dear user, we have detected suspicious activity on your account. Please click the link below to reset your password immediately:\n\nhttps://fake-bank.com/reset-password\n\nIf you did not request this change, please contact us at support@bank.com.",
        isPhishing: true,
      },
      {
        sender: "no-reply@amazon.com",
        recipient: playerRecipient,
        subject: "Your Order Has Been Shipped",
        body: "Hello, your recent order (#123456) has been shipped. You can track your delivery using the following link:\n\nhttps://amazon.com/track-order\n\nThank you for shopping with us!",
        isPhishing: false,
      },
      {
        sender: "noreply@paypal.com",
        recipient: playerRecipient,
        subject: "Action Required: Verify Your Account",
        body: "We noticed unusual login attempts on your PayPal account. To secure your account, please verify your identity by clicking the link below:\n\nhttps://fake-paypal.com/verify\n\nIf this was not you, please contact us immediately.",
        isPhishing: true,
      },
      {
        sender: "support@google.com",
        recipient: playerRecipient,
        subject: "Security Alert: New Sign-In Detected",
        body: "Hi user, we detected a new sign-in to your Google account from a new device. If this was you, you can ignore this message. If not, please secure your account here:\n\nhttps://myaccount.google.com/security",
        isPhishing: false,
      },
      {
        sender: "prizes@lottery.com",
        recipient: playerRecipient,
        subject: "Congratulations! You've Won $1000",
        body: "You are the lucky winner of a $1000 gift card! Click the link below to claim your prize:\n\nhttps://fake-lottery.com/claim-prize\n\nHurry, this offer expires soon!",
        isPhishing: true,
      },
      {
        sender: "security@apple.com",
        recipient: playerRecipient,
        subject: "Action Required: Unusual Login Attempt",
        body: "We detected a login attempt from a new device. If this was you, no action is needed. If not, secure your account here:\n\nhttps://appleid.apple.com",
        isPhishing: false,
      },
      {
        sender: "no-reply@facebook.com",
        recipient: playerRecipient,
        subject: "Your Account Has Been Temporarily Locked",
        body: "Due to suspicious activity, your account has been temporarily locked. Click the link below to unlock your account:\n\nhttps://fake-facebook.com/unlock-account\n\nIf you did not request this, please contact us immediately.",
        isPhishing: true,
      },
      {
        sender: "support@microsoft.com",
        recipient: playerRecipient,
        subject: "Important: Verify Your Account",
        body: "We noticed unusual activity on your Microsoft account. To protect your account, please verify your identity here:\n\nhttps://account.microsoft.com/security",
        isPhishing: false,
      },
      {
        sender: "billing@netflix.com",
        recipient: playerRecipient,
        subject: "Payment Failed - Update Your Payment Information",
        body: "We were unable to process your last payment. Please update your payment details to avoid service interruption:\n\nhttps://fake-netflix.com/update-payment",
        isPhishing: true,
      },
      {
        sender: "noreply@twitter.com",
        recipient: playerRecipient,
        subject: "Your Twitter Account Has Been Compromised",
        body: "We detected suspicious activity on your Twitter account. Click the link below to secure your account:\n\nhttps://twitter.com/account/secure",
        isPhishing: false,
      },
      {
        sender: "support@dropbox.com",
        recipient: playerRecipient,
        subject: "Your Dropbox Storage Is Full",
        body: "Your Dropbox storage is full. Upgrade your plan to continue syncing your files:\n\nhttps://fake-dropbox.com/upgrade",
        isPhishing: true,
      },
      {
        sender: "no-reply@linkedin.com",
        recipient: playerRecipient,
        subject: "You Have a New Message",
        body: "You have received a new message from a connection. Log in to view it:\n\nhttps://www.linkedin.com/messages",
        isPhishing: false,
      },
      {
        sender: "support@irs.gov",
        recipient: playerRecipient,
        subject: "Urgent: Tax Refund Notification",
        body: "You are eligible for a tax refund. Click the link below to claim your refund:\n\nhttps://fake-irs.com/claim-refund",
        isPhishing: true,
      },
      {
        sender: "no-reply@spotify.com",
        recipient: playerRecipient,
        subject: "Your Subscription Has Expired",
        body: "Your Spotify Premium subscription has expired. Renew now to continue enjoying ad-free music:\n\nhttps://www.spotify.com/renew",
        isPhishing: false,
      },
      {
        sender: "support@paypal.com",
        recipient: playerRecipient,
        subject: "Your Account Has Been Limited",
        body: "We have limited your account due to suspicious activity. Click the link below to resolve this issue:\n\nhttps://fake-paypal.com/resolve-issue",
        isPhishing: true,
      },
      {
        sender: "no-reply@ebay.com",
        recipient: playerRecipient,
        subject: "Your Order Has Been Confirmed",
        body: "Thank you for your purchase! Your order (#987654) has been confirmed. Track your shipment here:\n\nhttps://www.ebay.com/track-order",
        isPhishing: false,
      },
      {
        sender: "security@amazon.com",
        recipient: playerRecipient,
        subject: "Suspicious Activity Detected on Your Account",
        body: "We detected unusual activity on your Amazon account. Click the link below to secure your account:\n\nhttps://fake-amazon.com/secure-account",
        isPhishing: true,
      },
      {
        sender: "no-reply@google.com",
        recipient: playerRecipient,
        subject: "Your Google Drive Storage Is Full",
        body: "Your Google Drive storage is full. Upgrade your plan to continue storing files:\n\nhttps://drive.google.com/upgrade",
        isPhishing: false,
      },
      {
        sender: "support@bankofamerica.com",
        recipient: playerRecipient,
        subject: "Important: Verify Your Account",
        body: "We noticed unusual activity on your Bank of America account. Verify your identity here:\n\nhttps://fake-bankofamerica.com/verify",
        isPhishing: true,
      },
      {
        sender: "no-reply@instagram.com",
        recipient: playerRecipient,
        subject: "Your Account Has Been Temporarily Locked",
        body: "Due to suspicious activity, your account has been temporarily locked. Click the link below to unlock your account:\n\nhttps://www.instagram.com/unlock-account",
        isPhishing: false,
      },
    ];
  }

  private displayEmail() {
    let randomEmailIndex = Math.floor(Math.random() * this.emails.length);
    while (this.emailsSeen.has(randomEmailIndex)) {
      randomEmailIndex = Math.floor(Math.random() * this.emails.length);
    }
    const currentEmail = this.emails[randomEmailIndex];
    this.emailsSeen.add(randomEmailIndex);

    const emailContent = `
      From: ${currentEmail.sender}
      To: ${currentEmail.recipient}
      Subject: ${currentEmail.subject}

      ${currentEmail.body}
    `;

    this.emailText = this.scene.add
      .text(this.scene.cameras.main.centerX, 150, emailContent, {
        fontSize: "18px",
        color: "#ffffff",
        wordWrap: { width: 600, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);

    this.phishingButton = this.scene.add
      .text(this.scene.cameras.main.centerX - 100, 450, "Phishing", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#ff0000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on("pointerdown", () => this.handleChoice(true, randomEmailIndex));

    this.safeButton = this.scene.add
      .text(this.scene.cameras.main.centerX + 100, 450, "Safe", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#00ff00",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on("pointerdown", () => this.handleChoice(false, randomEmailIndex));
  }

  private handleChoice(isPhishing: boolean, emailIndex: number) {
    const currentEmail = this.emails[emailIndex];

    if (isPhishing === currentEmail.isPhishing) {
      this.score++;
      console.log("Correct choice!");
    } else {
      this.fails++;
      console.log("Incorrect choice!");
    }

    if (this.fails >= this.maxFails) {
      // Player loses
      this.endGame(false);
    } else if (this.score >= this.maxScore) {
      // Player wins
      this.endGame(true);
    } else {
      this.emailText.destroy();
      this.phishingButton.destroy();
      this.safeButton.destroy();

      this.displayEmail();
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
