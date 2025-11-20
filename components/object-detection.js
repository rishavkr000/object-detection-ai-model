"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/render-predictions";

let detectInterval = null;

const ObjectDetection = () => {
  const [isLoading, setIsLoading] = useState(true);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null); // store model globally

  // Load model + start detection loop
  const runCoco = async () => {
    setIsLoading(true);
    const net = await cocoSSDLoad();
    modelRef.current = net;
    setIsLoading(false);

    detectInterval = setInterval(() => {
      runObjectDetection();
    }, 10);
  };

  // Main detection logic
  const runObjectDetection = async () => {
    if (
      !modelRef.current ||
      !webcamRef.current ||
      !webcamRef.current.video ||
      webcamRef.current.video.readyState !== 4
    )
      return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const objects = await modelRef.current.detect(video, undefined, 0.6);
    const ctx = canvas.getContext("2d");

    renderPredictions(objects, ctx);
  };

  // Stop webcam completely
  const stopCamera = () => {
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  // Start webcam (if available)
  const startCamera = async () => {
    try {
      await webcamRef.current.video.play();
    } catch {}
  };

  // Visibility change handler
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopCamera();
      clearInterval(detectInterval);
    } else {
      startCamera();
      detectInterval = setInterval(() => runObjectDetection(), 10);
    }
  };

  // INITIAL PAGE LOAD
  useEffect(() => {
    runCoco();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopCamera();
      clearInterval(detectInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model...</div>
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          <Webcam
            ref={webcamRef}
            className="rounded-md w-full lg:h-[720px]"
            muted
            mirrored
          />

          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
          />
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
