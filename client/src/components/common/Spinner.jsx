import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={sizes[size]} className="animate-spin text-primary-500" />
    </div>
  );
}
