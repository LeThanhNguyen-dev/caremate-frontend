import { Outlet } from 'react-router-dom';
import Sidebar from './admin/Sidebar';
import Header from './admin/Header';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#F7F9FC] font-inter">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-0 lg:ml-[250px] flex flex-col min-w-0">
                <Header />

                {/* Content Area */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
