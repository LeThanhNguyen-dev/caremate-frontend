import { useState } from 'react';
import Sidebar from './admin/Sidebar';
import Header from './admin/Header';
import PageTransition from './PageTransition';

const AdminLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="theme-admin flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

            <main className="flex min-w-0 flex-1 flex-col lg:ml-[300px]">
                <Header onMenuToggle={() => setMobileMenuOpen((current) => !current)} />

                <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
                    <div className="w-full">
                        <PageTransition />
                    </div>
                </div>

                <footer className="mt-auto border-t border-slate-100 bg-white px-4 py-5 text-center sm:px-6 lg:px-7">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        CareMate Admin System © 2026. Quản trị & Bảo mật.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;
