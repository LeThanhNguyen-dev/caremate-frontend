import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    UserIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    MapPinIcon,
    CameraIcon,
    ShieldCheckIcon,
    WalletIcon,
    ClockIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

const CustomerProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'activity'>('info');

    const stats = [
        { label: 'Dịch vụ đã đặt', value: '12', icon: Squares2X2Icon, color: 'bg-blue-500' },
        { label: 'Tổng chi tiêu', value: '5.4M', icon: WalletIcon, color: 'bg-brand' },
        { label: 'Thời gian đồng hành', value: '4 tháng', icon: ClockIcon, color: 'bg-orange-500' },
    ];

    return (
        <div className="bg-slate-50 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header Profile */}
                <div className="bg-white rounded-[48px] p-12 shadow-xl shadow-slate-200/50 mb-12 flex flex-col md:flex-row items-center gap-12 border border-slate-100">
                    <div className="relative group">
                        <div className="h-40 w-40 rounded-[48px] bg-slate-100 overflow-hidden border-8 border-slate-50 relative">
                            {user?.username ? (
                                <div className="h-full w-full flex items-center justify-center text-6xl font-black text-brand bg-brand/5">
                                    {user.username.charAt(0)}
                                </div>
                            ) : (
                                <UserIcon className="h-full w-full p-10 text-slate-300" />
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-xl hover:bg-brand transition-colors">
                            <CameraIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                            <h1 className="text-4xl font-black text-slate-900">{user?.username || 'Khách hàng'}</h1>
                            <span className="px-4 py-1.5 rounded-full bg-brand/5 text-brand text-[10px] font-black uppercase tracking-widest border border-brand/10 w-fit mx-auto md:mx-0">Thành viên Bạc</span>
                        </div>
                        <p className="text-slate-400 font-medium mb-8 max-w-xl">
                            Cảm ơn bạn đã tin tưởng CareMate. Chúng tôi luôn sẵn sàng đồng hành cùng sức khỏe gia đình bạn.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl ${stat.color}/10 flex items-center justify-center`}>
                                        <stat.icon className={`h-5 w-5 text-${stat.color.split('-')[1]}-600`} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[350px_1fr] gap-12">
                    {/* Navigation Sidebar */}
                    <aside className="space-y-4">
                        {[
                            { id: 'info', name: 'Thông tin cá nhân', icon: UserIcon },
                            { id: 'security', name: 'Bảo mật & Mật khẩu', icon: ShieldCheckIcon },
                            { id: 'activity', name: 'Hoạt động gần đây', icon: ClockIcon },
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-4 p-5 rounded-[24px] transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' 
                                    : 'bg-white border border-slate-100 text-slate-500 hover:border-brand/30 hover:text-brand'
                                }`}
                            >
                                <tab.icon className="h-6 w-6" />
                                <span className="text-sm font-black">{tab.name}</span>
                            </button>
                        ))}
                    </aside>

                    {/* Main Content */}
                    <main className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                        {activeTab === 'info' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <h2 className="text-2xl font-black text-slate-900">Chi tiết tài khoản</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Họ và tên</label>
                                        <div className="relative group">
                                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                            <input type="text" defaultValue={user?.username} className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email liên hệ</label>
                                        <div className="relative group">
                                            <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                            <input type="email" defaultValue={user?.email} className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Số điện thoại</label>
                                        <div className="relative group">
                                            <PhoneIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                            <input type="text" defaultValue="090 1234 567" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Địa chỉ mặc định</label>
                                        <div className="relative group">
                                            <MapPinIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                            <input type="text" defaultValue="123 CareMate St, Quận 9, HCM" className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 flex justify-end">
                                    <button className="btn-primary !px-12">Lưu thay đổi</button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
                                <ShieldCheckIcon className="h-20 w-20 text-slate-200 mb-8" />
                                <h3 className="text-xl font-black text-slate-900 mb-2">Tính năng đang phát triển</h3>
                                <p className="text-slate-400 text-sm font-medium">Bảo mật đa lớp sẽ sớm ra mắt để bảo vệ tài khoản của bạn tốt hơn.</p>
                            </motion.div>
                        )}

                        {activeTab === 'activity' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 mb-8">Lịch sử hoạt động</h2>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-6 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Squares2X2Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">Đặt dịch vụ #CM9876{i}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gói chăm sóc sau sinh • Hoàn thành</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase">2 ngày trước</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage;



