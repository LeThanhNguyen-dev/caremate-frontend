import { motion } from 'framer-motion';
import { 
    ShieldExclamationIcon, 
    DocumentCheckIcon, 
    ArrowPathIcon 
} from '@heroicons/react/24/outline';

const NursePendingApproval = () => {
    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full text-center"
            >
                <div className="bg-white rounded-2xl p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
                    
                    <div className="relative z-10">
                        <div className="h-24 w-24 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-10 shadow-lg shadow-amber-500/10">
                            <ShieldExclamationIcon className="h-12 w-12 text-amber-500" />
                        </div>
                        
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                            Hồ sơ đang chờ <span className="text-amber-500">phê duyệt</span>
                        </h1>
                        
                        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                            Tài khoản của bạn đang được đội ngũ quản trị viên CareMate kiểm tra hồ sơ chuyên môn. 
                            Vui lòng quay lại sau khi hồ sơ được xác minh.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 text-left">
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <DocumentCheckIcon className="h-6 w-6 text-slate-400 mb-3" />
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Bước tiếp theo</div>
                                <div className="text-sm font-bold text-slate-700">Xác minh giấy tờ chuyên môn</div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <ArrowPathIcon className="h-6 w-6 text-slate-400 mb-3 animate-spin-slow" />
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Thời gian xử lý</div>
                                <div className="text-sm font-bold text-slate-700">Thường từ 12-24 giờ làm việc</div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-slate-50">
                            <p className="text-xs font-bold text-slate-400 italic">
                                "Chúng tôi luôn ưu tiên chất lượng và sự an toàn của khách hàng lên hàng đầu. 
                                Cảm ơn sự kiên nhẫn của bạn."
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NursePendingApproval;
