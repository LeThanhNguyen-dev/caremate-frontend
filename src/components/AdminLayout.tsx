import { Outlet } from 'react-router-dom';
import Sidebar from './admin/Sidebar';
import Header from './admin/Header';

const AdminLayout = () => {
    return (
        <div className="theme-admin flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 lg:ml-[300px]">
                <Header />
                
                <div className="flex-1 p-6 lg:p-10">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </div>

                <footer className="px-10 py-6 text-center border-t border-slate-100 mt-auto bg-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        CareMate Admin System © 2026. Quản trị & Bảo mật.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;
