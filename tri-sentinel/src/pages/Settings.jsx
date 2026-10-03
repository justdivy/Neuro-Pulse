import { useState } from 'react';
import { User, Activity, Bell, Bluetooth } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useBluetoothDevice from '../hooks/useBluetoothDevice';

export default function Settings() {
  const { user, authenticatedFetch, updateUser } = useAuth();
  const {
    device,
    firmware,
    isConnected,
    isConnecting,
    error: bluetoothError,
    connectDevice,
    disconnectDevice,
  } = useBluetoothDevice();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    institution: user.institution || '',
    dateOfBirth: /^\d{4}-\d{2}-\d{2}$/.test(user.dateOfBirth || '') ? user.dateOfBirth : '',
  });

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    const [year, month, day] = date.split('-');
    return year && month && day ? `${day}/${month}/${year}` : date;
  };

  const handleEdit = () => {
    setFormData({
      institution: user.institution || '',
      dateOfBirth: /^\d{4}-\d{2}-\d{2}$/.test(user.dateOfBirth || '') ? user.dateOfBirth : '',
    });
    setMessage('');
    setIsEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await authenticatedFetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { message: `Profile service returned an unexpected response (${response.status}).` };

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update profile.');
      }

      updateUser(data.user);
      setIsEditing(false);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

    return (
      <main className="min-h-full overflow-y-auto p-10 relative">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-1 mb-8">Manage your profile and device configurations</p>

          <div className="space-y-6">
            
            {/* Dynamic User Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-start gap-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                <p className="text-slate-500 mt-1">Patient UID: {user.uid}</p>

                {isEditing ? (
                  <form onSubmit={handleSave} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="institution" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution</label>
                      <input
                        id="institution"
                        type="text"
                        value={formData.institution}
                        onChange={(event) => setFormData({ ...formData, institution: event.target.value })}
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Enter institution"
                      />
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(event) => setFormData({ ...formData, dateOfBirth: event.target.value })}
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={isSaving} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 disabled:bg-slate-400">
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </button>
                      <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex gap-12 mt-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution</p>
                        <p className="text-slate-700 font-medium mt-1">{user.institution || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                        <p className="text-slate-700 font-medium mt-1">{formatDate(user.dateOfBirth)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleEdit} className="mt-6 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700">
                      Edit Profile
                    </button>
                  </>
                )}
                {message && <p className="mt-3 text-sm text-slate-500">{message}</p>}
              </div>
            </div>

            {/* Hardware Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Bluetooth className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-800">Connected Hardware</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                {isConnected ? (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">{device.name || 'Unnamed device'}</p>
                      <p className="text-xs text-slate-500 mt-1">Device ID: {device.id || 'Not available'}</p>
                      <p className="text-xs text-slate-500 mt-1">Firmware: {firmware || 'Not available'}</p>
                      {bluetoothError && <p className="text-xs text-amber-600 mt-2">{bluetoothError}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                        Connected
                      </span>
                      <button
                        type="button"
                        onClick={disconnectDevice}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-white"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">No device connected</p>
                      <p className="text-sm text-slate-500 mt-1">Connect a compatible Neuro-Pulse device to view its information.</p>
                      {bluetoothError && <p className="text-sm text-red-600 mt-2">{bluetoothError}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={connectDevice}
                      disabled={isConnecting}
                      className="shrink-0 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 disabled:bg-slate-400"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Device'}
                    </button>
                  </div>
                )}
                <p className={`text-xs font-bold mt-3 ${isConnected ? 'text-emerald-700' : 'text-slate-500'}`}>
                  Status: {isConnected ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>

            {/* Alert Preferences Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-bold text-slate-800">Alert Preferences</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Critical AI Predictions</p>
                  <p className="text-sm text-slate-500 mt-1">Immediate alerts for anomalous biometric spikes</p>
                </div>
                {/* Visual-only Toggle Switch */}
                <div className="w-12 h-6 bg-[#0891b2] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
  );
}