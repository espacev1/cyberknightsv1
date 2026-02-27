import { useEffect, useRef } from 'react';
import './RiskGauge.css';

const RiskGauge = ({ score = 0, classification = 'Safe', size = 200 }) => {
    const canvasRef = useRef(null);
    const animatedScore = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.38;
        const lineWidth = size * 0.08;

        const startAngle = 0.75 * Math.PI;
        const endAngle = 2.25 * Math.PI;
        const totalAngle = endAngle - startAngle;

        let frame;
        const duration = 1500;
        const startTime = performance.now();

        const getColor = (s) => {
            if (s <= 30) return '#22c55e';
            if (s <= 60) return '#f59e0b';
            return '#ef4444';
        };

        const getGlow = (s) => {
            if (s <= 30) return 'rgba(34, 197, 94, 0.3)';
            if (s <= 60) return 'rgba(245, 158, 11, 0.3)';
            return 'rgba(239, 68, 68, 0.3)';
        };

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.round(score * eased);
            animatedScore.current = currentScore;

            ctx.clearRect(0, 0, size, size);

            // Background arc
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Score arc
            const scoreAngle = startAngle + (totalAngle * (currentScore / 100));
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            const color = getColor(currentScore);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + 'cc');

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, scoreAngle);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.shadowColor = getGlow(currentScore);
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Score text
            ctx.fillStyle = color;
            ctx.font = `800 ${size * 0.2}px 'JetBrains Mono', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(currentScore, centerX, centerY - 5);

            // Label
            ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
            ctx.font = `500 ${size * 0.065}px 'Inter', sans-serif`;
            ctx.fillText('RISK SCORE', centerX, centerY + size * 0.14);

            if (progress < 1) {
                frame = requestAnimationFrame(animate);
            }
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [score, size]);

    const getClassColor = () => {
        if (classification === 'Safe') return 'badge-safe';
        if (classification === 'Medium Risk') return 'badge-medium';
        return 'badge-high';
    };

    return (
        <div className="risk-gauge">
            <canvas ref={canvasRef} className="risk-gauge-canvas" />
            <span className={`badge ${getClassColor()} risk-badge`}>
                {classification}
            </span>
        </div>
    );
};

export default RiskGauge;
