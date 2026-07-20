import Lottie from 'lottie-react';
import ecoPulseAnimation from '../assets/eco-pulse.json';

export default function EcoPulse({ className = 'h-24 w-24' }) {
  return (
    <Lottie
      animationData={ecoPulseAnimation}
      className={className}
      loop
      aria-label="Loading sustainability insights"
    />
  );
}
