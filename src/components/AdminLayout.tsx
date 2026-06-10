import Sidebar from './admin/Sidebar';
import Header from './admin/Header';
import PageTransition from './PageTransition';

const AdminLayout = () => {
    return (
        <div className="theme-admin flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 lg:ml-[300px]">
                <Header />
                
                <div className="flex-1 px-5 py-5 sm:px-6 lg:px-7">
                    <div className="w-full">
                        <PageTransition />
                    </div>
                </div>

                <footer className="mt-auto border-t border-slate-100 bg-white px-5 py-5 text-center sm:px-6 lg:px-7">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        CareMate Admin System © 2026. Quản trị & Bảo mật.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;
