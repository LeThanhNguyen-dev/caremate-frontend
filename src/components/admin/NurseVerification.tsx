import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { NurseProfileDetailDto } from '../../types/nurse';
import { UserIcon as UserOutlineIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const NurseVerification = () => {
    const [nurses, setNurses] = useState<NurseProfileDetailDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNurses = async () => {
            try {
                const data = await adminApi.getPendingNurses();
                setNurses(data.slice(0, 5)); /* Hiển thị top 5 y tá mới nhất */
            } catch (error) {
                console.error('Failed to fetch pending nurses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNurses();
    }, []);

    if (loading) {
        return (
            <div className="luxury-card p-10 flex flex-col items-center justify-center min-h-[300px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin border-t-transparent"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">Đang tải...</span>
            </div>
        );
    }

    return (
        <div className="luxury-card p-8 flex flex-col h-full border-none">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Xác minh Y tá</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Yêu cầu gia nhập mới nhất</p>
                </div>
                <span className="bg-admin/5 text-admin text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {nurses.length} Mới
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {nurses.length > 0 ? (
                    nurses.map((nurse) => (
                        <Link 
                            key={nurse.userId} 
                            to={`/admin/nurses/${nurse.userId}`} 
                            className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                                <UserOutlineIcon className="w-7 h-7 text-slate-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-slate-900 truncate mb-1">
                                    {nurse.fullName}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {nurse.yearsExperience} năm kinh nghiệm
                                    </span>
                                </div>
                            </div>
                            <ChevronRightIcon className="h-5 w-5 text-slate-200 group-hover:text-admin group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                        <UserOutlineIcon className="h-10 w-10 text-slate-200 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Không có yêu cầu chờ xử lý</p>
                    </div>
                )}
            </div>

            <Link 
                to="/admin/pending-nurses" 
                className="w-full mt-8 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-admin rounded-2xl transition-all"
            >
                Xem tất cả yêu cầu
            </Link>
        </div>
    );
};

export default NurseVerification;
