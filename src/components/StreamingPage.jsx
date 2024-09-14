import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const StreamX = () => {
  const userVideoRef = useRef(null);
  const [key, setKey] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const socketRef = useRef(null);
  const mediaRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('https://streamx-backend.onrender.com');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        mediaRef.current = media;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = media;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      if (mediaRef.current) {
        mediaRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStream = () => {
    if (!key.trim()) {
      alert('Please enter a key');
      return;
    }

    socketRef.current.emit('key', key);

    const mediaRecorder = new MediaRecorder(mediaRef.current, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
      framerate: 25
    });

    mediaRecorder.ondataavailable = (ev) => {
      console.log('Binary Stream Available', ev.data);
      socketRef.current.emit('binarystream', ev.data);
    };

    mediaRecorder.start(25);
    mediaRecorderRef.current = mediaRecorder;
    setIsStreaming(true);
  };

  const stopStream = () => {
    socketRef.current.emit('stop-stream');
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsStreaming(false);
  };

  const buttonClass = "inline-flex items-center rounded cursor-pointer px-6 py-3 font-semibold text-white transition";
  const startButtonClass = `${buttonClass} ${isStreaming ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#273ef1] [box-shadow:rgb(171,_196,245)_-8px_8px] hover:[box-shadow:rgb(171,_196,_245)_0px_0px]'}`;
  const stopButtonClass = `${buttonClass} ${!isStreaming ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 [box-shadow:rgb(255,_171,_171)_-8px_8px] hover:[box-shadow:rgb(255,_171,_171)_0px_0px]'}`;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">StreamX</h1>
        <video 
          ref={userVideoRef} 
          autoPlay 
          muted 
          className="w-full max-w-lg rounded-lg mb-6"
        />
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter Youtube stream key"
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={startStream}
          disabled={isStreaming}
          className={startButtonClass}
        >
          Start
        </button>
        <button
          onClick={stopStream}
          disabled={!isStreaming}
          className={stopButtonClass}
        >
          Stop Live
        </button>
      </div>
    </div>
  );
};

export default StreamX;