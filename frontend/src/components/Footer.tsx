import React from 'react';
import { Building2, ShieldCheck, Clock, Award, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 mt-24">
      {/* Guarantees Bar */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">10-Year Structural Warranty</h4>
              <p className="text-xs text-slate-400">Strict RCC standard mix & Fe 550D TMT rebar assurance.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">On-Time Handover Guarantee</h4>
              <p className="text-xs text-slate-400">Penalty clause for civil delays with daily site updates.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">10-Stage Milestone Pay</h4>
              <p className="text-xs text-slate-400">Zero front-loading. Pay strictly upon site stage inspection.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-heading font-extrabold text-lg text-white">ASTHIWAR DESIGN & BUILD</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
            Tamil Nadu's premier residential turnkey construction firm. Delivering bespoke architectural villas and family homes with 100% transparent pricing and real-time site engineering.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-gold">Coimbatore</span>
            <span className="badge badge-blue">Chennai</span>
            <span className="badge badge-blue">Tiruppur</span>
            <span className="badge badge-blue">Erode</span>
            <span className="badge badge-blue">Pollachi</span>
          </div>
        </div>

        <div>
          <h5 className="font-heading font-bold text-white text-sm mb-3">Office Locations</h5>
          <ul className="text-xs space-y-2">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Avinashi Road, Peelamedu, Coimbatore, TN 641004</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>OMR IT Corridor, Thoraipakkam, Chennai, TN 600097</span>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-heading font-bold text-white text-sm mb-3">Contact & Support</h5>
          <ul className="text-xs space-y-2">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+91 98765 43210 / +91 98765 43211</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>estimates@asthiwar.com</span>
            </li>
            <li className="text-[11px] text-slate-500 mt-2">
              Working Hours: Mon - Sat (9:00 AM - 7:30 PM IST)
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Asthiwar Design & Build Private Limited. All rights reserved.</p>
      </div>
    </footer>
  );
};
