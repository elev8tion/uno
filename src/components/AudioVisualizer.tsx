import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    level: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ level }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw level bar
        const width = canvas.width * level;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#60a5fa');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, canvas.height);

        // Draw peak indicator
        if (level > 0.9) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(canvas.width - 4, 0, 4, canvas.height);
        }
    }, [level]);

    return (
        <canvas
            ref={canvasRef}
            width={200}
            height={20}
            className="w-full rounded-lg"
        />
    );
};

export default AudioVisualizer; 