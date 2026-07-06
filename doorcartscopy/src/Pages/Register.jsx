import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Camera, MapPin, LocateFixed, Info } from 'lucide-react';
import { useAuth } from '../context/authContext';
import * as authService from '../api/authService';
import * as userService from '../api/userService';

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationSet, setLocationSet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const isFormValid = fullName.trim().length > 1 && address.trim().length > 3;

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
    // Note: the backend User model has no avatar/photo field today, so this
    // preview is local-only. Add an `avatarUrl` field to the User schema and
    // an upload endpoint if you want this persisted.
  };

  const handleSetLocation = () => {
    setLocating(true);
    // Placeholder for real geolocation lookup / map picker
    setTimeout(() => {
      setLocating(false);
      setLocationSet(true);
    }, 1200);
  };

  // Persists the display name via PUT /api/auth/me, then best-effort saves a
  // single free-text address as the user's default structured address via
  // POST /api/users/addresses. The backend's Address schema wants separate
  // city/state/postalCode fields; since this form only collects one free-text
  // line we stash it all in `line1` with placeholder values for the rest.
  // Swap in real city/state/pincode inputs for production use.
  const handleCreateUser = async () => {
    if (!isFormValid) return;
    setErrorMessage('');
    setIsSaving(true);
    try {
      await authService.updateMe({ name: fullName.trim() });

      try {
        await userService.addAddress({
          label: 'Home',
          fullName: fullName.trim(),
          phone: '',
          line1: address.trim(),
          city: 'N/A',
          state: 'N/A',
          postalCode: '000000',
          isDefault: true,
        });
      } catch (addrErr) {
        // Non-fatal: profile name is saved either way. Surface it in the
        // console for debugging rather than blocking the user.
        console.warn('Address could not be saved:', addrErr.response?.data?.message || addrErr.message);
      }

      await refreshUser();
      navigate('/home');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] flex flex-col font-sans">
      {/* Top App Bar */}
      <header className="bg-[#004aad] text-white fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md flex items-center justify-between px-4 h-16 z-50 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">Register</h1>
        <div className="w-9" />
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-10 px-6 flex flex-col gap-5 w-full">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center gap-2 mb-2">
          <button
            onClick={handlePhotoClick}
            className="relative w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
          >
            {photo ? (
              <img src={photo} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
            <span className="absolute bottom-0 right-0 bg-[#004aad] text-white rounded-full p-2 shadow-sm border-2 border-white">
              <Camera size={14} />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <p className="text-sm text-gray-500">Upload Profile Photo</p>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col gap-5">
          <div className="relative h-14">
            <input
              id="fullName"
              type="text"
              placeholder=" "
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="peer w-full h-full bg-transparent border border-gray-300 rounded-lg px-4 pt-2 text-gray-800 focus:outline-none focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] transition-all"
            />
            <label
              htmlFor="fullName"
              className={`absolute left-4 bg-[#f9f9fc] px-1 text-gray-500 transition-all duration-150 pointer-events-none ${
                fullName ? 'top-0 -translate-y-1/2 text-xs text-[#004aad]' : 'top-1/2 -translate-y-1/2'
              }`}
            >
              Full Name
            </label>
          </div>

          <div className="relative h-14">
            <input
              id="address"
              type="text"
              placeholder=" "
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="peer w-full h-full bg-transparent border border-gray-300 rounded-lg px-4 pt-2 text-gray-800 focus:outline-none focus:border-[#004aad] focus:ring-1 focus:ring-[#004aad] transition-all"
            />
            <label
              htmlFor="address"
              className={`absolute left-4 bg-[#f9f9fc] px-1 text-gray-500 transition-all duration-150 pointer-events-none ${
                address ? 'top-0 -translate-y-1/2 text-xs text-[#004aad]' : 'top-1/2 -translate-y-1/2'
              }`}
            >
              Complete Address
            </label>
          </div>
        </div>

        {/* Location Pinning */}
        <div className="flex flex-col gap-2 mt-2">
          <h2 className="text-lg font-bold text-gray-800">Pin Your Location</h2>
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 h-40 relative">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <MapPin
                size={36}
                className={locationSet ? 'text-[#004aad]' : 'text-gray-400'}
                fill={locationSet ? '#004aad' : 'none'}
              />
            </div>
            <button
              onClick={handleSetLocation}
              disabled={locating}
              className="absolute bottom-3 right-3 bg-white text-[#004aad] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-1 active:scale-95 transition-transform disabled:opacity-60"
            >
              <LocateFixed size={14} className={locating ? 'animate-spin' : ''} />
              {locating ? 'Locating...' : locationSet ? 'Location Set' : 'Set Location'}
            </button>
          </div>
          <p className="text-xs text-gray-500 flex items-start gap-1">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            Accurate location ensures timely delivery service.
          </p>
        </div>

        {errorMessage && (
          <p className="text-xs text-center text-red-500 font-semibold px-2">{errorMessage}</p>
        )}

        <div className="flex-grow" />

        {/* Primary Action */}
        <button
          onClick={handleCreateUser}
          disabled={!isFormValid || isSaving}
          className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm mt-4 ${
            isFormValid && !isSaving ? 'bg-[#004aad] text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isSaving ? 'Saving...' : 'Create New User'}
          {!isSaving && <ArrowRight size={20} />}
        </button>
      </main>
    </div>
  );
}