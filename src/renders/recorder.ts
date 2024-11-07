import { startrecording, stoprecording } from "../audio/engine";
import 
 { CanvasRecorder } from "../utils";

let isRecording = ref(false);
let recorder: CanvasRecorder | null = null;
let pianoRecorder: CanvasRecorder | null = null;

function record(visualizerCanvas: HTMLCanvasElement, pianoCanvas: HTMLCanvasElement) {
  if (isRecording.value && recorder && pianoRecorder) { 
    stoprecording()
    recorder.stopRecording();
    recorder.download("visualizer");
    pianoRecorder.stopRecording();
    pianoRecorder.download("keyboard");
    isRecording.value = false;
  } else {
    startrecording()
    recorder = new CanvasRecorder(visualizerCanvas);
    pianoRecorder = new CanvasRecorder(pianoCanvas);
    recorder.startRecording();
    pianoRecorder.startRecording();
    isRecording.value = true;
  }
}

export {
    record,
    isRecording
}