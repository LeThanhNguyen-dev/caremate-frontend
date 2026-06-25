import { useState } from 'react';
import NurseSidebar from './nurse/NurseSidebar';
import NurseHeader from './nurse/NurseHeader';
import NurseActionTour from './nurse/NurseActionTour';
import PageTransition from './PageTransition';

const NurseLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="theme-nurse flex min-h-screen bg-[#f7fbf9] font-sans text-slate-900">
            <NurseSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            <main className="flex min-w-0 flex-1 flex-col lg:ml-[300px]">
                <NurseHeader onMenuToggle={() => setMobileMenuOpen((current) => !current)} />

                <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
                    <div className="w-full">
                        <PageTransition />
                    </div>
                </div>

                <footer className="mt-auto border-t border-slate-100 bg-white/60 px-4 py-5 text-center sm:px-6 lg:px-7">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        CareMate Professional Portal © 2026. Chuyên nghiệp & Tận tâm.
                    </p>
                </footer>
            </main>
            <NurseActionTour />
        </div>
    );
};

export default NurseLayout;
