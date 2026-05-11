import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CameraIcon,
    ShieldCheckIcon,
    ClockIcon,
    Squares2X2Icon,
    LockClosedIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import caremateApi from '../api/caremateApi';
import authApi from '../api/authApi';

const CustomerProfilePage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'activity'>('info');

    // Profile form state
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordSaving, setPasswordSaving] = useState(false);

    // Activity state
    const [recentBookings, setRecentBookings] = useState<Array<{ id: number; serviceName: string; status: string; startTime: string }>>([]);

    // Load profile from API
    const loadProfile = useCallback(async () => {
        try {
            setProfileLoading(true);
            const data = await caremateApi.getMyProfile();
            setProfileForm({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
            });
        } catch {
            // Fallback to auth context
            setProfileForm({
                fullName: user?.username || '',
                email: user?.email || '',
                phone: '',
                address: '',
            });
        } finally {
            setProfileLoading(false);
        }
    }, [user]);

    // Load recent bookings for activity tab
    const loadActivity = useCallback(async () => {
        try {
            const bookings = await caremateApi.getMyCustomerBookings();
            setRecentBookings(bookings.slice(0, 5).map(b => ({
                id: b.id,
                serviceName: b.serviceName,
                status: b.status,
                startTime: b.startTime,
            })));
        } catch {
            // Silently fail
        }
    }, []);

    useEffect(() => {
        void loadProfile();
        void loadActivity();
    }, [loadProfile, loadActivity]);

    // Save profile
    const handleSaveProfile = async () => {
        try {
            setProfileSaving(true);
            await caremateApi.updateMyProfile({
                fullName: profileForm.fullName,
                phone: profileForm.phone,
                address: profileForm.address,
            });
            showToast('Cập nhật thông tin thành công!', 'success');
        } catch {
            showToast('Không thể lưu thay đổi.', 'error');
        } finally {
            setProfileSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp.', 'error');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
            return;
        }

        try {
            setPasswordSaving(true);
            await authApi.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            showToast('Đổi mật khẩu thành công!', 'success');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            showToast('Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.', 'error');
        } finally {
            setPasswordSaving(false);
        }
    };

    const statusLabels: Record<string, { label: string; class: string }> = {
        completed: { label: 'Hoàn thành', class: 'bg-emerald-50 text-emerald-600' },
        confirmed: { label: 'Đã xác nhận', class: 'bg-blue-50 text-blue-600' },
        in_progress: { label: 'Đang thực hiện', class: 'bg-brand/5 text-brand' },
        pending_confirm: { label: 'Chờ xác nhận', class: 'bg-amber-50 text-amber-600' },
        cancelled: { label: 'Đã hủy', class: 'bg-slate-50 text-slate-400' },
    };

    return (
        <div className="bg-slate-50 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header Profile */}
                <div className="bg-white rounded-xl p-12 shadow-xl shadow-slate-200/50 mb-12 flex flex-col md:flex-row items-center gap-12 border border-slate-100">
                    <div className="relative group">
                        <div className="h-40 w-40 rounded-xl bg-slate-100 overflow-hidden border-8 border-slate-50 relative">
                            {profileForm.fullName ? (
                                <div className="h-full w-full flex items-center justify-center text-6xl font-black text-brand bg-brand/5">
                                    {profileForm.fullName.charAt(0)}
                                </div>
                            ) : (
                                <UserIcon className="h-full w-full p-10 text-slate-300" />
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 h-12 w-12 rounded-lg bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-xl hover:bg-brand transition-colors">
                            <CameraIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 justify-center md:justify-start">
                            <h1 className="text-4xl font-black text-slate-900">{profileForm.fullName || 'Khách hàng'}</h1>
                            <span className="px-4 py-1.5 rounded-xl bg-brand/5 text-brand text-[10px] font-black uppercase tracking-widest border border-brand/10 w-fit mx-auto md:mx-0">Thành viên</span>
                        </div>
                        <p className="text-slate-400 font-medium mb-8 max-w-xl">
                            Cảm ơn bạn đã tin tưởng CareMate. Chúng tôi luôn sẵn sàng đồng hành cùng sức khỏe gia đình bạn.
                        </p>
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            {profileForm.email && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <EnvelopeIcon className="h-4 w-4" />
                                    <span className="font-bold">{profileForm.email}</span>
                                </div>
                            )}
                            {profileForm.phone && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <PhoneIcon className="h-4 w-4" />
                                    <span className="font-bold">{profileForm.phone}</span>
                                </div>
                            )}
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
                                className={`w-full flex items-center gap-4 p-5 rounded-xl transition-all ${
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
                    <main className="bg-white rounded-xl p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                        {/* Tab: Info */}
                        {activeTab === 'info' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <h2 className="text-2xl font-black text-slate-900">Chi tiết tài khoản</h2>

                                {profileLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand border-t-transparent"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Họ và tên</label>
                                                <div className="relative group">
                                                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={profileForm.fullName}
                                                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                                        className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email liên hệ</label>
                                                <div className="relative group">
                                                    <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                                    <input
                                                        type="email"
                                                        value={profileForm.email}
                                                        readOnly
                                                        className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Số điện thoại</label>
                                                <div className="relative group">
                                                    <PhoneIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        placeholder="Chưa có số điện thoại"
                                                        className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Địa chỉ mặc định</label>
                                                <div className="relative group">
                                                    <MapPinIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={profileForm.address}
                                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                                        placeholder="Chưa có địa chỉ"
                                                        className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-8 flex justify-end">
                                            <button
                                                onClick={() => void handleSaveProfile()}
                                                disabled={profileSaving}
                                                className="btn-primary !px-12 disabled:opacity-50"
                                            >
                                                {profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Tab: Security - Change Password */}
                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">Đổi mật khẩu</h2>
                                    <p className="text-sm font-medium text-slate-400">Cập nhật mật khẩu để bảo vệ tài khoản an toàn hơn.</p>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mật khẩu hiện tại</label>
                                        <div className="relative group">
                                            <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                placeholder="Nhập mật khẩu hiện tại"
                                                required
                                                className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mật khẩu mới</label>
                                        <div className="relative group">
                                            <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="Ít nhất 6 ký tự"
                                                required
                                                minLength={6}
                                                className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Xác nhận mật khẩu mới</label>
                                        <div className="relative group">
                                            <LockClosedIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                                            <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="Nhập lại mật khẩu mới"
                                                required
                                                minLength={6}
                                                className="w-full bg-slate-50 border-none rounded-lg py-4 pl-14 pr-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-brand/5 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-3">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="text-xs font-medium text-amber-700 leading-relaxed">
                                            Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại trên tất cả các thiết bị khác.
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={passwordSaving}
                                        className="btn-primary !px-12 disabled:opacity-50"
                                    >
                                        {passwordSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Tab: Activity */}
                        {activeTab === 'activity' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 mb-8">Lịch sử hoạt động</h2>
                                {recentBookings.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <Squares2X2Icon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-slate-400">Chưa có hoạt động nào.</p>
                                    </div>
                                ) : (
                                    recentBookings.map((booking) => {
                                        const statusCfg = statusLabels[booking.status] || { label: booking.status, class: 'bg-slate-50 text-slate-400' };
                                        return (
                                            <div key={booking.id} className="flex items-center justify-between p-6 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-12 w-12 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                                                        <CheckCircleIcon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900">#{booking.id} — {booking.serviceName}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                            {new Date(booking.startTime).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${statusCfg.class}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
