import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowTopRightOnSquareIcon,
    ChatBubbleBottomCenterTextIcon,
    CheckBadgeIcon,
    ClockIcon,
    EnvelopeIcon,
    HeartIcon,
    MapPinIcon,
    PhoneIcon,
    ShieldCheckIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';

const mapUrl = 'https://maps.app.goo.gl/smYL7LcejKTJixmF9';
const mapEmbedUrl = 'https://www.google.com/maps?q=FPT%20University%20Da%20Nang%20Campus%2C%20FPT%20City%2C%20Ngu%20Hanh%20Son%2C%20Da%20Nang%2C%20Vietnam&output=embed';

const AboutUs = () => {
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSending(true);
        setTimeout(() => {
            showToast('Cảm ơn bạn đã gửi ý kiến! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
            setSending(false);
            (event.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <div className="bg-white pb-20">
            <section className="relative overflow-hidden bg-[#10233F] px-6 py-24 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(236,72,153,0.24),transparent_32%),radial-gradient(circle_at_84%_22%,rgba(16,185,129,0.12),transparent_30%)]" />
                <div className="relative z-10 mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                        className="max-w-3xl"
                    >
                        <div className="mb-6 w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-brand shadow-sm">
                            Về CareMate
                        </div>
                        <h1 className="text-[54px] font-black leading-[1.04] tracking-tight text-white sm:text-[70px] lg:text-[88px]">
                            Chăm sóc
                            <span className="mt-2 block font-semibold italic text-brand sm:mt-3">bằng trái tim.</span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-[18px] font-black leading-8 text-white">
                            CareMate kết nối điều dưỡng chuyên nghiệp với các gia đình, mang lại sự an tâm cho mẹ và bé trong từng buổi chăm sóc.
                        </p>
                        <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-[1.8] text-white/60">
                            Chúng tôi giữ mọi thứ rõ ràng: hồ sơ y tá, lịch làm việc, chi phí và đánh giá đều được trình bày minh bạch trước khi đặt lịch.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-4">
                            <a
                                href="#about-contact"
                                className="rounded-full bg-brand px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-deep"
                            >
                                Liên hệ CareMate
                            </a>
                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-[#10233F] shadow-xl shadow-[#10233F]/15 transition hover:-translate-y-0.5 hover:text-brand"
                            >
                                Mở bản đồ
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="relative z-20 mx-auto -mt-14 grid max-w-7xl gap-6 px-6 lg:grid-cols-3 lg:px-8">
                {[
                    { icon: MapPinIcon, label: 'Trụ sở chính', value: 'FPT University Đà Nẵng, Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng' },
                    { icon: EnvelopeIcon, label: 'Email hỗ trợ', value: 'support@caremate.com.vn' },
                    { icon: PhoneIcon, label: 'Hotline 24/7', value: '1900 6789' },
                ].map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="luxury-card border-none bg-white p-8 shadow-2xl shadow-slate-200/70"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                        <div className="mt-2 text-sm font-black leading-6 text-[#10233F]">{item.value}</div>
                    </motion.div>
                ))}
            </section>

            <section id="about-contact" className="mx-auto mt-28 grid max-w-7xl items-start gap-16 px-6 lg:grid-cols-2 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10233F] text-white">
                            <MapPinIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#10233F]">Vị trí của chúng tôi</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">FPT University Đà Nẵng</p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border-8 border-white bg-slate-100 shadow-inner">
                        <iframe
                            title="Bản đồ vị trí CareMate"
                            src={mapEmbedUrl}
                            className="aspect-square w-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
                    <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#10233F] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#10233F]/15 transition hover:-translate-y-0.5 hover:bg-brand"
                    >
                        Xem đường đi trên Google Maps
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="luxury-card border-none bg-white p-10 shadow-2xl shadow-slate-200/70"
                >
                    <div className="mb-10 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10233F] text-white shadow-lg shadow-pink-500/20">
                            <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#10233F]">Gửi ý kiến đóng góp</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Chúng tôi luôn lắng nghe bạn</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
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
                            <textarea className="form-input min-h-[150px] resize-none py-4" placeholder="Nhập nội dung bạn muốn chia sẻ..." required />
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="btn-primary w-full rounded-xl py-4 text-[10px] font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {sending ? 'Đang gửi...' : 'Gửi thông điệp ngay'}
                            <SparklesIcon className="h-4 w-4" />
                        </button>
                    </form>
                </motion.div>
            </section>

            <section className="mt-32 bg-[linear-gradient(135deg,#f7fafc_0%,#fff2f8_55%,#f3fbf8_100%)] py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <div className="accent-label mx-auto bg-white shadow-sm">Giá trị cốt lõi</div>
                    <h2 className="mt-4 text-4xl font-black text-[#10233F]">Triết lý của CareMate</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        { title: 'Chuyên nghiệp', desc: 'Đội ngũ điều dưỡng được đào tạo bài bản và có chứng chỉ hành nghề.', icon: ShieldCheckIcon },
                        { title: 'Tận tâm', desc: 'Lắng nghe và thấu hiểu từng nhu cầu nhỏ nhất của mẹ và bé.', icon: HeartIcon },
                        { title: 'Minh bạch', desc: 'Giá cả và thông tin y tá luôn rõ ràng, công khai trên hệ thống.', icon: CheckBadgeIcon },
                        { title: 'Đúng giờ', desc: 'Quản lý lịch làm việc để gia đình dễ chọn khung giờ phù hợp.', icon: ClockIcon },
                    ].map((value) => (
                        <div key={value.title} className="rounded-2xl border border-white bg-white/90 p-7 text-center shadow-xl shadow-slate-200/55 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10233F] text-white shadow-lg shadow-[#10233F]/10">
                                <value.icon className="h-8 w-8" />
                            </div>
                            <h4 className="mb-2 text-lg font-black text-[#10233F]">{value.title}</h4>
                            <p className="text-sm font-medium leading-relaxed text-slate-500">{value.desc}</p>
                        </div>
                    ))}
                </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
