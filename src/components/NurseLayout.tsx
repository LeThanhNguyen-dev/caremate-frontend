import { Outlet } from 'react-router-dom';
import NurseSidebar from './nurse/NurseSidebar';
import NurseHeader from './nurse/NurseHeader';

const NurseLayout = () => {
    return (
        <div className="theme-nurse flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <NurseSidebar />

            <main className="flex-1 flex flex-col min-w-0 lg:ml-[300px]">
                <NurseHeader />
                
                <div className="flex-1 p-6 lg:p-10">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </div>

                {/* Footer simple */}
                <footer className="px-10 py-6 text-center border-t border-slate-100 mt-auto bg-white/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        CareMate Professional Portal © 2026. Chuyên nghiệp & Tận tâm.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default NurseLayout;
