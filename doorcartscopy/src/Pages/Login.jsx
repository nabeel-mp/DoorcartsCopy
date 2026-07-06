import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronsRight, MailCheck } from 'lucide-react';
import { useAuth } from '../context/authContext';
import * as authService from '../api/authService';

const RESEND_SECONDS = 30;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('splash'); // 'splash', 'login', 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(RESEND_SECONDS);

  // Async/error state for the real API calls
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Slide-to-Verify States & Refs
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);

  const otpRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null),
  ];

  // Transition from Splash to Login
  useEffect(() => {
    if (step === 'splash') {
      const timeout = setTimeout(() => setStep('login'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Reset slide position when coming back to the login step
  useEffect(() => {
    if (step !== 'login') return;
    const frame = requestAnimationFrame(() => setSlidePosition(0));
    return () => cancelAnimationFrame(frame);
  }, [step]);

  // Handle OTP resend timer countdown
  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const isVerifyEnabled = termsAccepted && phoneNumber.length >= 10 && !isSendingOtp;

  // Calls POST /api/auth/send-otp, then transitions to the OTP screen.
  const handleVerifyMobile = async () => {
    if (!isVerifyEnabled) {
      setErrorMessage('Please enter a valid number and accept the terms.');
      return;
    }
    setErrorMessage('');
    setIsSendingOtp(true);
    try {
      await authService.sendOtp(phoneNumber);
      setOtp(['', '', '', '', '', '']);
      setStep('otp');
      setTimer(RESEND_SECONDS);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not send OTP. Please try again.');
      setSlidePosition(0);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isSendingOtp) return;
    setErrorMessage('');
    setIsSendingOtp(true);
    try {
      await authService.sendOtp(phoneNumber);
      setTimer(RESEND_SECONDS);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Calls POST /api/auth/verify-otp. On success, the backend sets the
  // httpOnly auth cookie and returns { user, token }; authService stores the
  // token as a fallback and we push the user into AuthContext.
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== otp.length) {
      setErrorMessage('Please enter the full code.');
      return;
    }
    setErrorMessage('');
    setIsVerifying(true);
    try {
      const { user } = await authService.verifyOtp(phoneNumber, code);
      login(user);
      // Brand new users have no name yet - send them to complete their profile.
      navigate(user?.name ? '/home' : '/register');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Incorrect OTP code.');
    } finally {
      setIsVerifying(false);
    }
  };

  // --- Slide to Verify Logic ---
  const handlePointerDown = (e) => {
    if (!isVerifyEnabled) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !trackRef.current || !thumbRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const thumbWidth = thumbRef.current.offsetWidth;
    const maxSlide = trackRect.width - thumbWidth - 8;

    let newX = e.clientX - trackRect.left - (thumbWidth / 2);
    if (newX < 0) newX = 0;
    if (newX > maxSlide) newX = maxSlide;

    setSlidePosition(newX);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const trackRect = trackRef.current?.getBoundingClientRect();
    const thumbWidth = thumbRef.current?.offsetWidth;
    if (!trackRect || !thumbWidth) return;

    const maxSlide = trackRect.width - thumbWidth - 8;

    if (slidePosition > maxSlide * 0.85) {
      setSlidePosition(maxSlide);
      handleVerifyMobile();
    } else {
      setSlidePosition(0);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[100dvh] overflow-hidden bg-white shadow-2xl flex flex-col font-sans">

      {/* BACKGROUND & SPLASH/LOGIN VIEWS */}
      <div
        className={`absolute inset-0 bg-[#004aad] text-white flex flex-col items-center transition-all duration-700 ease-in-out z-10 ${
          step === 'otp' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        <div
          className={`flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
            step === 'splash' ? 'mt-[20vh]' : 'mt-[15vh]'
          }`}
        >
          <div className="rounded-xl p-2 w-40 h-40 flex items-center justify-center mb-4">
            <img src="/Doorcarts.png" alt="Doorcarts" className="w-30 h-30 object-contain" onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span class="text-white font-bold text-4xl">D</span>'; }} />
          </div>

          <h1 className={`font-bold transition-all duration-500 ${step === 'splash' ? 'text-4xl' : 'text-3xl opacity-100'}`}>
            Doorcarts
          </h1>
        </div>

        <div className={`absolute bottom-8 text-center transition-opacity duration-300 ${step === 'splash' ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[10px] uppercase tracking-wider font-semibold">Doorcarts International</p>
          <p className="text-[10px] uppercase tracking-wider font-semibold">Enterprises LLP</p>
        </div>

        {/* SLIDING BOTTOM SHEET (LOGIN) */}
        <div
          className={`absolute bottom-0 w-full bg-white text-gray-800 rounded-t-[2rem] px-6 py-8 pb-10 transition-transform duration-700 ease-out shadow-[0_-10px_40px_rgba(0,0,0,0.1)] ${
            step === 'login' ? 'translate-y-0' : 'translate-y-[120%]'
          }`}
        >
          <h2 className="text-center text-[#004aad] font-semibold text-xl mb-8">
            Login With Mobile
          </h2>

          <div className="relative mb-6">
            <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs text-[#004aad] font-medium z-10">
              Mobile Number
            </label>
            <div className="flex items-center border border-[#004aad] rounded-xl px-4 py-3 bg-white focus-within:ring-2 ring-blue-100">
              <span className="text-gray-600 font-medium mr-2">+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="00000 00000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full outline-none bg-transparent font-medium tracking-wide placeholder-gray-300 text-gray-800"
              />
            </div>
          </div>

          <p className="text-[10px] text-center text-gray-500 font-medium leading-tight mb-4 px-4">
            We'll text you a one-time code to verify this number.
          </p>

          {errorMessage && (
            <p className="text-xs text-center text-red-500 font-semibold mb-4 px-4">{errorMessage}</p>
          )}

          <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
            <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${termsAccepted ? 'bg-[#004aad] border-[#004aad]' : 'border-gray-300 bg-gray-50'}`}>
              {termsAccepted && <span className="text-white text-[10px]">✓</span>}
            </div>
            <span className="text-xs font-semibold text-gray-700">
              You accept our privacy and policies
            </span>
          </div>

          {/* Slide to Verify Button */}
          <div
            ref={trackRef}
            className={`relative flex items-center w-full h-14 rounded-2xl overflow-hidden select-none touch-none transition-colors ${
              isVerifyEnabled ? 'bg-[#004aad] shadow-md' : 'bg-gray-200'
            }`}
          >
            <div
              ref={thumbRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ transform: `translateX(${slidePosition}px)` }}
              className={`absolute left-1 z-10 w-12 h-12 flex items-center justify-center rounded-xl transition-transform ${
                isDragging ? 'duration-0' : 'duration-300 ease-out'
              } ${
                isVerifyEnabled
                  ? 'bg-white text-[#004aad] cursor-grab active:cursor-grabbing shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronsRight size={22} strokeWidth={2.5} />
            </div>

            <div className={`w-full text-center font-bold text-lg pointer-events-none transition-opacity duration-300 ${
              isVerifyEnabled ? 'text-white' : 'text-gray-400'
            } ${slidePosition > 40 ? 'opacity-0' : 'opacity-100'}`}>
              {isSendingOtp ? 'Sending OTP...' : 'Slide to verify'}
            </div>
          </div>
        </div>
      </div>

      {/* OTP VERIFICATION VIEW */}
      <div
        className={`absolute inset-0 bg-[#f8f9fc] flex flex-col z-20 transition-transform duration-500 ease-in-out ${
          step === 'otp' ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative flex items-center justify-center pt-12 pb-4 px-6">
          <button
            onClick={() => { setStep('login'); setErrorMessage(''); }}
            className="absolute left-6 text-gray-700 hover:text-black transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Verification</h1>
        </div>

        <div className="flex-1 flex flex-col items-center pt-8 px-6">
          <div className="bg-[#004aad] text-white p-4 rounded-3xl mb-8 shadow-lg shadow-blue-200">
            <MailCheck size={36} strokeWidth={1.5} />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify your number</h2>
          <p className="text-sm text-gray-500 text-center mb-1">
            Enter the code sent to your mobile number
          </p>
          <p className="text-sm font-bold text-gray-800 mb-8">
            +91 {phoneNumber.replace(/(\d{5})(\d{5})/, '$1 $2')}
          </p>

          <div className="flex justify-center gap-2 w-full mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-11 h-14 bg-white border border-gray-200 text-center text-xl font-bold rounded-2xl focus:border-[#004aad] focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          {errorMessage && (
            <p className="text-xs text-center text-red-500 font-semibold mb-4 px-4">{errorMessage}</p>
          )}

          <div className="flex items-center text-sm font-medium mb-8">
            <span className="text-gray-500 mr-2">Didn't receive the code?</span>
            <button
              disabled={timer > 0 || isSendingOtp}
              className={`${timer > 0 ? 'text-gray-400' : 'text-[#004aad] hover:underline'}`}
              onClick={handleResend}
            >
              Resend {timer > 0 && `(00:${timer.toString().padStart(2, '0')})`}
            </button>
          </div>

          <button
            className="w-full bg-[#004aad] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform disabled:opacity-60"
            onClick={handleVerifyOtp}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Proceed'}
            {!isVerifying && <ArrowRight size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

    </div>
  );
}