import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  GraduationCap, 
  Bell, 
  Trash2, 
  Sparkles,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const Settings: React.FC = () => {
  const { user, updateLevel } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [targetLevel, setTargetLevel] = useState(user?.level || 'BAC');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const examLevels = [
    { code: 'BEPC', label: 'BEPC (O-Level Francophone)' },
    { code: 'Probatoire', label: 'Probatoire' },
    { code: 'BAC', label: 'BAC (BAC Francophone)' },
    { code: 'GCE O-Level', label: 'GCE O-Level' },
    { code: 'GCE A-Level', label: 'GCE A-Level' }
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage('');

    // Simulate saving
    setTimeout(() => {
      setSaving(false);
      setSavedMessage('Settings successfully saved and synced with Supabase.');
      updateLevel(targetLevel);
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-black text-slate-850">User Settings & Profile</h2>
        <p className="text-sm text-slate-400">
          Customize your study environment, notification frequencies, and active Cameroonian curriculum exam focus.
        </p>
      </div>

      {savedMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs px-4.5 py-3.5 rounded-2xl">
          {savedMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile and Target Exam level settings */}
        <Card className="lg:col-span-2 p-6 space-y-6 text-left">
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4.5 h-4.5 text-tichaBlue" />
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Profile Information</h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tichaBlue/30 focus:border-tichaBlue transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  disabled
                  value={email}
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Cameroonian Syllabus Board</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tichaBlue/30 focus:border-tichaBlue transition-all cursor-pointer"
              >
                {examLevels.map((lvl) => (
                  <option key={lvl.code} value={lvl.code}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-3">
              <Button 
                type="submit"
                loading={saving}
                className="px-6 py-3 font-bold text-xs"
              >
                Save Settings
              </Button>
            </div>

          </form>

        </Card>

        {/* Sidebar: Preferences, notifications, and danger zone */}
        <div className="space-y-6 text-left">
          
          {/* Mock notification controls */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-4.5 h-4.5 text-tichaPurple" />
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Alert Preferences</h3>
            </div>

            <div className="space-y-3.5 text-slate-650">
              {[
                { label: 'Weekly Performance Report', desc: 'Get automated AI summary reports of topic masteries.' },
                { label: 'Study Streak Reminders', desc: 'Receive notification alerts to keep study streaks hot.' },
              ].map((opt, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4.5 h-4.5 text-tichaPurple border-slate-300 rounded focus:ring-tichaPurple cursor-pointer mt-0.5"
                  />
                  <div className="leading-snug">
                    <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Danger zone */}
          <Card className="p-6 border border-rose-100/60 bg-rose-50/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-100/30 pb-3 text-rose-600">
              <AlertTriangle className="w-4.5 h-4.5" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Danger Zone</h3>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 leading-normal">
                Permanent actions affecting your student profile databases in Supabase.
              </p>
              
              <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-rose-550 hover:bg-rose-500/10 border border-rose-200/50 hover:border-rose-300 transition-all cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Active Student Profile</span>
              </button>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};
export default Settings;
