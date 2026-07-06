import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-card max-w-md p-8 flex flex-col items-center">
        <FiAlertTriangle className="text-5xl text-yellow-500 mb-4" />
        <h1 className="text-4xl font-extrabold font-outfit text-[var(--color-text-primary)]">404</h1>
        <h3 className="text-lg font-semibold mt-2">Page Not Found</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
          The link you followed may be broken, or the page may have been removed. Let's head back to the dashboard.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6 flex items-center gap-2 text-xs">
          <FiHome />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
