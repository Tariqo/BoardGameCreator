import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Mail,
  Users,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between text-left px-3 py-2 hover:bg-white/10 rounded-md transition"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="text-xs bg-red-500 px-2 rounded-full">{badge}</span>
      )}
    </button>
  );
};

const ProfileSidebar: React.FC = () => {
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gradient-to-b from-[#1B1D2A] to-[#2A2D3E] text-white h-full flex flex-col justify-between">
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-lg font-bold tracking-wide">Table Top Studio</h1>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-400" />
            <div>
              <p className="font-medium">Welcome back, {user?.username}</p>
              <p className="text-sm text-gray-300">Community profile</p>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarButton
              icon={<Gamepad2 size={18} />}
              label="Game Editor"
              onClick={() => navigate('/editor')}
            />
            <SidebarButton icon={<Mail size={18} />} label="Invites" />
            <SidebarButton icon={<Users size={18} />} label="Profile" />
            {role === 'admin' && (
              <SidebarButton icon={<Shield size={18} />} label="Admin Tools" />
            )}
          </nav>
        </div>
      </div>

      <div className="p-6 space-y-2 border-t border-white/10">
        <SidebarButton icon={<HelpCircle size={18} />} label="Help" />
        <SidebarButton icon={<LogOut size={18} />} label="Log out" onClick={logout} />
      </div>
    </aside>
  );
};

export default ProfileSidebar;
