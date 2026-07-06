import { useNavigate } from 'react-router-dom';
import { HardHat, CalendarDays, Headphones, User } from 'lucide-react';

export default function BottomNav({ active = 'services' }) {
  const navigate = useNavigate();

  const items = [
    { key: 'services', label: 'Services', icon: HardHat, path: '/home' },
    { key: 'bookings', label: 'Bookings', icon: CalendarDays, path: '/order-history' },
    { key: 'support', label: 'Support', icon: Headphones, path: '/support' },
    { key: 'account', label: 'Account', icon: User, path: '/account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full max-w-md mx-auto right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 px-2 pb-safe">
      {items.map(({ key, label, icon: Icon, path }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-xl transition-all active:scale-90 duration-200 ${
              isActive
                ? 'bg-[#e5edfa] text-[#004aad]'
                : 'text-gray-400 hover:text-[#004aad]'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}