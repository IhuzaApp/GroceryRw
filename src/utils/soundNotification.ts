// Sound notification utility for new messages
class SoundNotification {
  private audio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private lastPlayTime: number = 0;
  private debounceDelay: number = 1000; // 1 second debounce

  constructor() {
    // Only initialize audio element in browser environment
    if (typeof window !== "undefined") {
      this.audio = new Audio("/assets/sounds/newMessage.mp3");
      this.audio.preload = "auto";
      this.audio.volume = 0.9; // Set volume to 90%
    }
  }

  // Play notification sound with debouncing
  play(): void {
    if (!this.isEnabled || !this.audio || typeof window === "undefined") return;

    const now = Date.now();

    // Debounce: Don't play if we played recently
    if (now - this.lastPlayTime < this.debounceDelay) {
      console.log(
        "🔊 [Sound Notification] Debounced - too soon since last play"
      );
      return;
    }

    try {
      // Reset audio to beginning in case it's already playing
      this.audio.currentTime = 0;
      this.audio.play().catch((error) => {
        console.warn("Could not play notification sound:", error);
      });

      this.lastPlayTime = now;
      console.log("🔊 [Sound Notification] Playing notification sound");
    } catch (error) {
      console.warn("Error playing notification sound:", error);
    }
  }

  // Enable/disable sound notifications
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if sound is enabled
  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume: number): void {
    if (this.audio && typeof window !== "undefined") {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// Create singleton instance
const soundNotification = new SoundNotification();

export default soundNotification;
