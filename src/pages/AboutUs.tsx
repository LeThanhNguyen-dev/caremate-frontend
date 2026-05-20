import { motion } from 'framer-motion';
import { 
    MapPinIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    ClockIcon,
    ChatBubbleBottomCenterTextIcon, HeartIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';

const AboutUs = () => {
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            showToast('Cảm ơn bạn đã gửi ý kiến! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
            setSending(false);
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-b from-brand/20 to-transparent"></div>
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="accent-label !bg-white/20 !text-white border-white/20 mx-auto">Về CareMate</div>
                        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                            Chăm sóc bằng <br /><span className="text-white">cả trái tim</span>
                        </h1>
                        <p className="mt-8 text-lg font-medium text-white/50 max-w-2xl mx-auto leading-relaxed">
                            CareMate ra đời với sứ mệnh kết nối những điều dưỡng chuyên nghiệp nhất đến với các gia đình, 
                            mang lại sự an tâm tuyệt đối cho mẹ và bé trong những năm tháng đầu đời.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Info Cards */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: MapPinIcon, label: 'Trụ sở chính', value: 'Khu Công nghệ cao, Quận 9, TP. HCM' },
                        { icon: EnvelopeIcon, label: 'Email hỗ trợ', value: 'support@caremate.com.vn' },
                        { icon: PhoneIcon, label: 'Hotline 24/7', value: '1900 6789' },
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="luxury-card p-8 flex flex-col items-center text-center border-none shadow-2xl"
                        >
                            <div className="h-12 w-12 rounded-xl bg-slate-900/5 flex items-center justify-center text-white mb-6">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">{item.label}</div>
                            <div className="text-sm font-extrabold text-[#0F172A]">{item.value}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Map & Form Section */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-32 grid lg:grid-cols-2 gap-16 items-start">
                {/* Map Placeholder */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <MapPinIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0F172A]">Vị trí của chúng tôi</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ghé thăm văn phòng CareMate</p>
                        </div>
                    </div>
                    <div className="aspect-square w-full rounded-xl bg-slate-100 overflow-hidden shadow-inner border-8 border-white relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                            <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 animate-bounce">
                                <MapPinIcon className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-xl font-extrabold text-[#0F172A]">CareMate HQ</h3>
                            <p className="mt-2 text-sm font-medium text-slate-500">Lô E2a-7, Đường D1, Khu Công nghệ cao, Long Thạnh Mỹ, Quận 9, Thành phố Hồ Chí Minh</p>
                        </div>
                        {/* Mock Map Image Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    </div>
                </motion.div>

                {/* Feedback Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="luxury-card p-10 border-none shadow-2xl bg-white"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#0F172A]">Gửi ý kiến đóng góp</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chúng tôi luôn lắng nghe bạn</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">Họ và tên</label>
                                <input type="text" className="form-input" placeholder="Nguyễn Văn A" required />
                            </div>
                            <div>
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" placeholder="a@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Chủ đề</label>
                            <select className="form-input appearance-none bg-slate-50">
                                <option>Góp ý dịch vụ</option>
                                <option>Hợp tác chuyên môn</option>
                                <option>Hỗ trợ kỹ thuật</option>
                                <option>Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Nội dung tin nhắn</label>
                            <textarea className="form-input min-h-[150px] py-4 resize-none" placeholder="Nhập nội dung bạn muốn chia sẻ..." required></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={sending}
                            className="btn-primary w-full py-4 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                            {sending ? 'Đang gửi...' : 'Gửi thông điệp ngay'}
                            <SparklesIcon className="h-4 w-4" />
                        </button>
                    </form>
                </motion.div>
            </section>

            {/* Core Values */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-32">
                <div className="text-center mb-16">
                    <div className="accent-label mx-auto">Giá trị cốt lõi</div>
                    <h2 className="mt-4 text-3xl font-extrabold text-[#0F172A]">Triết lý của CareMate</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        { title: 'Chuyên nghiệp', desc: 'Đội ngũ điều dưỡng được đào tạo bài bản và có chứng chỉ hành nghề.', icon: ClockIcon },
                        { title: 'Tận tâm', desc: 'Lắng nghe và thấu hiểu từng nhu cầu nhỏ nhất của mẹ và bé.', icon: HeartIcon },
                        { title: 'Minh bạch', desc: 'Giá cả và thông tin y tá luôn rõ ràng, công khai trên hệ thống.', icon: SparklesIcon },
                    ].map((val, i) => (
                        <div key={i} className="text-center">
                            <div className="h-16 w-16 rounded-xl bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <val.icon className="h-8 w-8" />
                            </div>
                            <h4 className="text-lg font-extrabold text-[#0F172A] mb-2">{val.title}</h4>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">{val.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AboutUs;





