import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import type { NurseProfileDetailDto } from '../api/frontend-api-contract';
import { 
    ArrowTopRightOnSquareIcon, 
    ArrowPathIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../hooks/useToast';

const AdminPendingNurses = () => {
    const { showToast } = useToast();
    const [pendingNurses, setPendingNurses] = useState<NurseProfileDetailDto[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingNurses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await caremateApi.getPendingNurses();
            setPendingNurses(data);
        } catch (err) {
            showToast('Không thể tải danh sách điều dưỡng chờ duyệt.', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void fetchPendingNurses();
    }, [fetchPendingNurses]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#3B82F6] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang quét hồ sơ điều dưỡng...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#3B82F6] text-[9px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                        <ShieldCheckIcon className="h-3 w-3" />
                        Trung tâm xác minh
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                        Duyệt <span className="text-[#3B82F6]">Điều dưỡng</span> mới
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Bạn có <span className="text-[#3B82F6] font-black">{pendingNurses.length}</span> hồ sơ mới đang chờ phê duyệt gia nhập hệ thống.
                    </p>
                </div>
                
                <button 
                    onClick={fetchPendingNurses}
                    className="flex items-center gap-2 px-8 py-4 rounded-lg bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all shadow-sm active:scale-95"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    Làm mới dữ liệu
                </button>
            </div>

            {/* List Section */}
            <AnimatePresence mode="wait">
                {pendingNurses.length === 0 ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-xl p-24 text-center border border-slate-50 shadow-xl shadow-slate-200/20"
                    >
                        <div className="h-24 w-24 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-8">
                            <ShieldCheckIcon className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Hệ thống đang ổn định!</h3>
                        <p className="text-slate-400 text-lg font-medium">Hiện tại không có hồ sơ nào đang tồn đọng cần xử lý.</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {pendingNurses.map((nurse, idx) => (
                            <motion.div 
                                key={nurse.userId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-xl p-8 border border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500"
                            >
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="h-20 w-20 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-slate-900/10 transition-transform group-hover:scale-110">
                                        {nurse.fullName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black text-slate-900 truncate tracking-tight">{nurse.fullName}</h3>
                                        <p className="text-sm font-bold text-slate-400 truncate mt-1">{nurse.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AcademicCapIcon className="h-3.5 w-3.5 text-[#3B82F6]" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Kinh nghiệm</span>
                                        </div>
                                        <div className="text-sm font-black text-slate-900">{nurse.yearsExperience} năm</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DocumentTextIcon className="h-3.5 w-3.5 text-[#3B82F6]" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tài liệu</span>
                                        </div>
                                        <div className="text-sm font-black text-slate-900">{nurse.documents?.length || 0} bản gửi</div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-3 italic">
                                        "{nurse.bio || 'Ứng viên này hiện chưa cung cấp giới thiệu bản thân.'}"
                                    </p>
                                </div>

                                <Link 
                                    to={`/admin/nurses/${nurse.userId}`} 
                                    className="flex items-center justify-center gap-3 w-full py-4 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#3B82F6] transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                                >
                                    Kiểm tra hồ sơ
                                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPendingNurses;
