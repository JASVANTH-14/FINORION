import { useEffect, useRef } from 'react';

interface RiskChartProps {
  riskPercentage: number;
  overallRiskLevel: string;
}

export default function RiskChart({ riskPercentage, overallRiskLevel }: RiskChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 80;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#2a3d4a';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, width, 0);

    if (riskPercentage >= 80) {
      gradient.addColorStop(0, '#DC2626');
      gradient.addColorStop(1, '#B91C1C');
    } else if (riskPercentage >= 60) {
      gradient.addColorStop(0, '#EA580C');
      gradient.addColorStop(1, '#DC2626');
    } else if (riskPercentage >= 40) {
      gradient.addColorStop(0, '#FACC15');
      gradient.addColorStop(1, '#EA580C');
    } else {
      gradient.addColorStop(0, '#22C55E');
      gradient.addColorStop(1, '#10B981');
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI * riskPercentage) / 100;
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${riskPercentage.toFixed(0)}%`, centerX, centerY);

    ctx.font = '14px sans-serif';
    ctx.fillText(overallRiskLevel.toUpperCase(), centerX, centerY + 30);
  }, [riskPercentage, overallRiskLevel]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="mb-4"
      />
      <div className="flex justify-between w-full max-w-xs text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-neongreen">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span className="text-gray-300">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-600"></div>
          <span className="text-gray-300">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="text-gray-300">Critical</span>
        </div>
      </div>
    </div>
  );
}
