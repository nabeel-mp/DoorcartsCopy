import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, MessageSquare, Headphones } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-24">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#004aad] shadow-md flex items-center gap-3 px-4 h-16">
        <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-white">Help & Support</h1>
      </header>

      <main className="pt-20 px-5 space-y-6">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Headphones size={40} className="text-[#004aad]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">How can we help?</h2>
          <p className="text-sm text-gray-500 mt-2">Our support team is available 24/7 to assist you with any inquiries.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <a href="tel:+919999999999" className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#004aad]">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Call Us</h3>
              <p className="text-sm text-gray-500">+91 99999 99999</p>
            </div>
          </a>

          <a href="mailto:support@doorcarts.com" className="flex items-center gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Email Us</h3>
              <p className="text-sm text-gray-500">support@doorcarts.com</p>
            </div>
          </a>

          <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Live Chat</h3>
              <p className="text-sm text-gray-500">Typical reply in 5 mins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
          <MapPin size={28} className="text-[#004aad] flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Corporate Office</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Doorcarts International Enterprises LLP<br />
              123 Business Avenue, Tech Park<br />
              Kochi, Kerala, India 682001
            </p>
          </div>
        </div>
      </main>

      <BottomNav active="support" />
    </div>
  );
}