import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CalculatorWizard } from './components/calculator/CalculatorWizard';
import { AdminPortal } from './components/admin/AdminPortal';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'calculator' | 'admin'>('calculator');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <Header currentView={currentView} onNavigate={(v) => setCurrentView(v)} />

      <main className="flex-grow">
        {currentView === 'calculator' ? (
          <div>
            {/* Hero Section */}
            <div className="relative pt-8 pb-4 text-center px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tamil Nadu's Most Accurate Turnkey Construction Estimator</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
                  Build Your Dream Home with <br />
                  <span className="text-gold-gradient">100% Transparent Pricing</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Real-time engineering budget calculation with city-specific material rates, 15 add-on infrastructure options, and zero surprise cost escalations.
                </p>
              </div>
            </div>

            {/* Interactive Calculator Wizard */}
            <CalculatorWizard />
          </div>
        ) : (
          <AdminPortal onBackToCalculator={() => setCurrentView('calculator')} />
        )}
      </main>

      <Footer />
    </div>
  );
};
