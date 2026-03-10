import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

export default function Countdown({ targetDate, onExpire, label = 'Booking closes in' }) {
  const calculateTimeLeft = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const t = calculateTimeLeft();
      setTimeLeft(t);
      if (!t && onExpire) onExpire();
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  if (!timeLeft) return null;

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="rounded-xl bg-dark-900 border border-primary-500/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={15} className="text-primary-500 animate-pulse shrink-0" />
        <span className="text-xs font-medium text-dark-300">{label}</span>
      </div>
      <div className="flex items-center justify-between gap-1">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center justify-center bg-dark-800 border border-primary-500/30 rounded-lg py-2 px-2 min-w-0 w-[62px]">
              <span className="text-xl font-bold text-white font-heading tabular-nums leading-none">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-dark-400 mt-1 leading-none">{unit.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-primary-500 text-base font-bold animate-pulse leading-none">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
