import React from 'react';
import { Home, Dumbbell, Sun, User, Sparkles, HeartPulse, LogOut, LogIn, Utensils, Bell } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isAuthenticated: boolean;
  onAuthAction: () => void;
  displayName: string | null;
  onOpenNotifications?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isAuthenticated,
  onAuthAction,
  displayName,
  onOpenNotifications
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'library', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'wellness', label: 'Wellness', icon: HeartPulse },
    { id: 'seasonal', label: 'Programs', icon: Sun },
    { id: 'facial', label: 'Glow-Up', icon: Sparkles },
    { id: 'progress', label: 'Progress', icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-charcoal-950/95 backdrop-blur-lg border-t border-charcoal-800 z-40 px-1 py-1.5 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
                isActive ? 'text-forge-lime font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[9px] mt-0.5 font-sans leading-none">{tab.label}</span>
            </button>
          );
        })}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-gray-400 hover:text-forge-lime transition-all relative"
            title="Daily Reminder Settings"
          >
            <Bell className="w-4 h-4 stroke-2" />
            <span className="text-[9px] mt-0.5 font-sans leading-none">Alerts</span>
            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-forge-lime" />
          </button>
        )}
      </nav>

      {/* Desktop Top Header Bar */}
      <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-charcoal-950/90 backdrop-blur-md border-b border-charcoal-800 sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-forge-lime flex items-center justify-center text-black font-black text-xl shadow-forge-glow">
            B
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            BODY<span className="text-forge-lime">FORGE</span>
          </span>
        </div>

        <div className="flex items-center gap-1 bg-charcoal-900 border border-charcoal-800 p-1 rounded-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-charcoal-800 text-forge-lime border border-charcoal-700 shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gray-300 hover:text-forge-lime hover:border-charcoal-700 transition-all relative group"
              title="Daily Workout Reminders"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-forge-lime group-hover:scale-125 transition-transform animate-pulse" />
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-1">
              <span className="text-xs text-gray-300 font-mono">{displayName || 'Athlete'}</span>
              <button
                onClick={onAuthAction}
                className="p-2 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gray-400 hover:text-white transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthAction}
              className="px-4 py-2 rounded-xl bg-forge-lime text-black font-bold text-xs flex items-center gap-1.5 shadow-forge-glow hover:bg-forge-lime-hover transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </header>
    </>
  );
};
