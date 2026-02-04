import { useState } from "react";
import { useSTT } from "../hooks/useSTT";

function Microphone({ onFinalText }) {
  const [recording, setRecording] = useState(false);

  const { start, stop } = useSTT((finalText) => {
    if (finalText) {
      onFinalText(finalText); // send text to ChatUI
    }
    setRecording(false);
  });

  const startMic = async () => {
    setRecording(true);
    await start();
  };

  const stopMic = () => {
    stop();
    setRecording(false);
  };

  return (
    <div>
      {!recording ? (
        <button onClick={startMic}>🎤 Start Speaking</button>
      ) : (
        <button onClick={stopMic}>⏹ Stop</button>
      )}
    </div>
  );
}

export default Microphone;
