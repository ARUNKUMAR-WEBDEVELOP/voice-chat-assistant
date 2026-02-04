// src/hooks/useSTT.js
export function useSTT(onFinalText) {
  let ws;
  let audioContext;
  let processor;
  let stream;

  const start = async () => {
    ws = new WebSocket("ws://localhost:8001/ws/stt");


    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.is_final && data.text) {
        onFinalText(data.text);
      }
    };

    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext({ sampleRate: 16000 });

    const source = audioContext.createMediaStreamSource(stream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm = new Int16Array(input.length);

      for (let i = 0; i < input.length; i++) {
        pcm[i] = Math.max(-1, Math.min(1, input[i])) * 32767;
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(pcm.buffer);
      }
    };
  };

  const stop = () => {
    processor?.disconnect();
    audioContext?.close();
    stream?.getTracks().forEach(t => t.stop());
    ws?.close();
  };

  return { start, stop };
}
