import NurseSidebar from './nurse/NurseSidebar';
import NurseHeader from './nurse/NurseHeader';
import PageTransition from './PageTransition';

const NurseLayout = () => {
    return (
        <div className="theme-nurse flex min-h-screen bg-[#f7fbf9] font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <NurseSidebar />

            <main className="flex-1 flex flex-col min-w-0 lg:ml-[300px]">
                <NurseHeader />
                
                <div className="flex-1 px-5 py-5 sm:px-6 lg:px-7">
                    <div className="w-full">
                        <PageTransition />
                    </div>
                </div>

                {/* Footer simple */}
                <footer className="mt-auto border-t border-slate-100 bg-white/60 px-5 py-5 text-center sm:px-6 lg:px-7">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        CareMate Professional Portal © 2026. Chuyên nghiệp & Tận tâm.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default NurseLayout;
