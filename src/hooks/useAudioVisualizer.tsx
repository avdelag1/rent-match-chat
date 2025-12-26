import { useEffect, useRef, useState, useCallback } from 'react';

export interface AudioVisualizerData {
  // Raw frequency data (0-255 values)
  frequencyData: Uint8Array;
  // Normalized frequency bands (0-1 values)
  bass: number;
  mid: number;
  treble: number;
  // Overall energy level (0-1)
  energy: number;
  // Peak detection for rhythm
  isPeak: boolean;
  // Average amplitude (0-1)
  amplitude: number;
}

interface UseAudioVisualizerOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  enabled?: boolean;
}

const defaultData: AudioVisualizerData = {
  frequencyData: new Uint8Array(0),
  bass: 0,
  mid: 0,
  treble: 0,
  energy: 0,
  isPeak: false,
  amplitude: 0,
};

export const useAudioVisualizer = (
  audioElement: HTMLAudioElement | null,
  options: UseAudioVisualizerOptions = {}
) => {
  const {
    fftSize = 256,
    smoothingTimeConstant = 0.8,
    enabled = true
  } = options;

  const [data, setData] = useState<AudioVisualizerData>(defaultData);
  const [isConnected, setIsConnected] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEnergyRef = useRef<number>(0);
  const peakThresholdRef = useRef<number>(0.15);
  const connectedElementRef = useRef<HTMLAudioElement | null>(null);

  const disconnect = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Don't disconnect the source node as it can only be connected once
    // Just stop the animation loop
    setIsConnected(false);
    setData(defaultData);
  }, []);

  const connect = useCallback(() => {
    if (!audioElement || !enabled) {
      disconnect();
      return;
    }

    // If already connected to this element, just ensure we're running
    if (connectedElementRef.current === audioElement && isConnected) {
      return;
    }

    try {
      // Create audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create analyser if needed
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = fftSize;
        analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
      }

      // Connect source only if not already connected to this element
      if (connectedElementRef.current !== audioElement) {
        // Create new source for this audio element
        try {
          sourceRef.current = audioContext.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContext.destination);
          connectedElementRef.current = audioElement;
        } catch (e) {
          // Element might already be connected, which is fine
          console.log('Audio element already connected to context');
        }
      }

      setIsConnected(true);

      // Start the animation loop
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const frequencyData = new Uint8Array(bufferLength);

      const analyze = () => {
        if (!analyserRef.current) return;

        analyser.getByteFrequencyData(frequencyData);

        // Calculate frequency bands
        const bassEnd = Math.floor(bufferLength * 0.1); // 0-10% = bass
        const midEnd = Math.floor(bufferLength * 0.5);  // 10-50% = mid
        // 50-100% = treble

        let bassSum = 0;
        let midSum = 0;
        let trebleSum = 0;
        let totalSum = 0;

        for (let i = 0; i < bufferLength; i++) {
          const value = frequencyData[i];
          totalSum += value;

          if (i < bassEnd) {
            bassSum += value;
          } else if (i < midEnd) {
            midSum += value;
          } else {
            trebleSum += value;
          }
        }

        // Normalize values to 0-1
        const bass = bassEnd > 0 ? bassSum / (bassEnd * 255) : 0;
        const mid = (midEnd - bassEnd) > 0 ? midSum / ((midEnd - bassEnd) * 255) : 0;
        const treble = (bufferLength - midEnd) > 0 ? trebleSum / ((bufferLength - midEnd) * 255) : 0;
        const energy = totalSum / (bufferLength * 255);
        const amplitude = Math.max(bass, mid, treble);

        // Peak detection
        const energyDelta = energy - lastEnergyRef.current;
        const isPeak = energyDelta > peakThresholdRef.current && energy > 0.2;
        lastEnergyRef.current = energy * 0.9 + lastEnergyRef.current * 0.1; // Smooth

        setData({
          frequencyData: new Uint8Array(frequencyData),
          bass,
          mid,
          treble,
          energy,
          isPeak,
          amplitude,
        });

        rafRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (error) {
      console.error('Failed to initialize audio visualizer:', error);
      disconnect();
    }
  }, [audioElement, enabled, fftSize, smoothingTimeConstant, disconnect, isConnected]);

  // Connect/disconnect when audio element changes
  useEffect(() => {
    if (audioElement && enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [audioElement, enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // Don't close the context, just stop updates
      }
    };
  }, [disconnect]);

  return {
    ...data,
    isConnected,
    connect,
    disconnect,
  };
};

// Simulated visualizer for when we can't access the actual audio
// Uses random/animated values for visual effect
export const useSimulatedVisualizer = (isPlaying: boolean) => {
  const [data, setData] = useState<AudioVisualizerData>(defaultData);
  const rafRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setData(defaultData);
      return;
    }

    const animate = () => {
      timeRef.current += 0.05;
      const t = timeRef.current;

      // Generate smooth, music-like patterns
      const bass = 0.4 + 0.4 * Math.sin(t * 2) * Math.sin(t * 0.7);
      const mid = 0.3 + 0.3 * Math.sin(t * 3.2 + 1) * Math.sin(t * 1.1);
      const treble = 0.2 + 0.25 * Math.sin(t * 5 + 2) * Math.sin(t * 1.5);

      // Add some randomness for realism
      const randomFactor = 0.1;
      const bassWithNoise = Math.max(0, Math.min(1, bass + (Math.random() - 0.5) * randomFactor));
      const midWithNoise = Math.max(0, Math.min(1, mid + (Math.random() - 0.5) * randomFactor));
      const trebleWithNoise = Math.max(0, Math.min(1, treble + (Math.random() - 0.5) * randomFactor));

      const energy = (bassWithNoise + midWithNoise + trebleWithNoise) / 3;
      const amplitude = Math.max(bassWithNoise, midWithNoise, trebleWithNoise);

      // Simulate beat detection
      const beatPattern = Math.sin(t * 4) > 0.8;
      const isPeak = beatPattern && Math.random() > 0.6;

      // Generate fake frequency data for bar visualizations
      const frequencyData = new Uint8Array(64);
      for (let i = 0; i < 64; i++) {
        const freq = i / 64;
        let value = 0;
        if (freq < 0.15) {
          value = bassWithNoise * 255 * (1 - freq * 3);
        } else if (freq < 0.5) {
          value = midWithNoise * 255 * (1 - Math.abs(freq - 0.3) * 2);
        } else {
          value = trebleWithNoise * 255 * (1 - (freq - 0.5) * 1.5);
        }
        frequencyData[i] = Math.max(0, Math.min(255, value + (Math.random() - 0.5) * 30));
      }

      setData({
        frequencyData,
        bass: bassWithNoise,
        mid: midWithNoise,
        treble: trebleWithNoise,
        energy,
        isPeak,
        amplitude,
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying]);

  return data;
};
