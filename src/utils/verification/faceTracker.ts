import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";

export type LivenessStep =
  | "center"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "success";

export class FaceTracker {
  private detector: any = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig: any = {
      runtime: "tfjs",
      refineLandmarks: false, // OFF for speed
    };

    this.detector = await faceLandmarksDetection.createDetector(
      model,
      detectorConfig
    );
    this.isInitialized = true;
  }

  private offscreenCanvas: HTMLCanvasElement | null = null;

  async detect(
    video: HTMLVideoElement
  ): Promise<{ yaw: number; pitch: number; roll: number } | null> {
    if (!this.detector || !video) return null;

    // Internal downscaling - targeted at 800px for better profile robustness
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement("canvas");
    }

    // Higher resolution (800p-ish) helps detect faces at sharper side angles
    const scale = Math.min(1, 800 / video.videoWidth);
    const width = video.videoWidth * scale;
    const height = video.videoHeight * scale;

    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    const ctx = this.offscreenCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);

    // flipHorizontal: true matches the mirrored UI view, making logic more intuitive
    const faces = await this.detector.estimateFaces(this.offscreenCanvas, {
      flipHorizontal: true,
    });

    if (!faces || faces.length === 0) {
      return null;
    }

    const face = faces[0];
    const keypoints = face.keypoints;

    const nose = keypoints[1];
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];

    const eyeDist = Math.abs(rightEye.x - leftEye.x);
    const eyeCenter = (leftEye.x + rightEye.x) / 2;

    // In flipped coords: Positive yaw = Right, Negative yaw = Left
    const yaw = (nose.x - eyeCenter) / (eyeDist * 0.5);

    const mouthLeft = keypoints[61];
    const mouthRight = keypoints[291];
    const eyeY = (leftEye.y + rightEye.y) / 2;
    const mouthY = (mouthLeft.y + mouthRight.y) / 2;
    const faceHeight = Math.abs(mouthY - eyeY);
    const faceCenterY = (eyeY + mouthY) / 2;
    const pitch = (nose.y - faceCenterY) / (faceHeight * 0.4);

    return { yaw, pitch, roll: 0 };
  }

  isMatching(
    pose: { yaw: number; pitch: number },
    step: LivenessStep
  ): boolean {
    const sideThreshold = 0.22; // Slightly more relaxed for quicker capture
    const centerThreshold = 0.18;

    switch (step) {
      case "center":
        return (
          Math.abs(pose.yaw) < centerThreshold &&
          Math.abs(pose.pitch) < centerThreshold
        );
      case "left":
        return pose.yaw < -sideThreshold;
      case "right":
        return pose.yaw > sideThreshold;
      default:
        return false;
    }
  }
}

export const faceTracker = new FaceTracker();
