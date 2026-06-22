import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowRightIcon,
    BoltIcon,
    CalendarDaysIcon,
    CheckBadgeIcon,
    CursorArrowRaysIcon,
    CpuChipIcon,
    EnvelopeIcon,
    HandRaisedIcon,
    HeartIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import HealthCheckInsEntryPage from './HealthCheckInsEntryPage';

const stats = [
    { label: 'Khách hàng', value: '1,900+', sub: 'Gia đình tin tưởng' },
    { label: 'Y tá chuyên môn', value: '500+', sub: 'Xác minh 100%' },
    { label: 'Hài lòng', value: '99%', sub: 'Đánh giá tích cực' },
    { label: 'Đánh giá', value: '4.9/5', sub: 'Sao trung bình' },
];

const featuredServices = [
    {
        title: 'Chăm sóc sau sinh',
        price: 'Tại nhà',
        image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1200&auto=format&fit=crop',
    },
    {
        title: 'Tư vấn nhanh',
        price: '15 phút',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
    },
    {
        title: 'Theo dõi mẹ & bé',
        price: 'Gợi ý AI',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1200&auto=format&fit=crop',
    },
];

const steps = [
    { step: '01', title: 'Chọn dịch vụ', desc: 'Duyệt qua danh mục dịch vụ chăm sóc đa dạng từ CareMate.', icon: CursorArrowRaysIcon },
    { step: '02', title: 'Tìm y tá ưng ý', desc: 'Xem hồ sơ, kinh nghiệm và đánh giá thực tế của y tá.', icon: UserPlusIcon },
    { step: '03', title: 'Đặt lịch hẹn', desc: 'Lựa chọn thời gian phù hợp với lịch sinh hoạt của gia đình.', icon: CalendarDaysIcon },
    { step: '04', title: 'Tận hưởng chăm sóc', desc: 'Điều dưỡng đến nhà thực hiện quy trình chuyên môn.', icon: HandRaisedIcon },
];

const archiveCards = [
    {
        title: 'Cộng đồng CareMate',
        desc: 'Thảo luận và chia sẻ kinh nghiệm cùng các mẹ bỉm.',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop',
        link: '/community',
    },
    {
        title: 'Tiêu chuẩn y khoa',
        desc: 'Quy trình đào tạo và kiểm soát chất lượng.',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1400&auto=format&fit=crop',
        link: '/about',
    },
    {
        title: 'Gói chăm sóc dài ngày',
        desc: 'Theo dõi nhiều buổi, rõ tiến độ từng phiên.',
        image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1400&auto=format&fit=crop',
        link: '/services',
    },
    {
        title: 'Hồ sơ y tá',
        desc: 'Ảnh đại diện, chứng chỉ, CCCD và đánh giá.',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1400&auto=format&fit=crop',
        link: '/find-nurse',
    },
    {
        title: 'Gợi ý dịch vụ',
        desc: 'Phân tích tình trạng và đề xuất dịch vụ phù hợp.',
        image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?q=80&w=1400&auto=format&fit=crop',
        link: '/health-checkins',
    },
];

const values = [
    { title: 'Y tá chuyên nghiệp', desc: '100% điều dưỡng có bằng cấp và chứng chỉ hành nghề chính quy.', icon: ShieldCheckIcon },
    { title: 'Dịch vụ tận tâm', desc: 'Luôn lắng nghe và chăm sóc mẹ bé như người thân trong gia đình.', icon: HeartIcon },
    { title: 'Minh bạch & An toàn', desc: 'Giá cả công khai, hồ sơ y tá được kiểm định nghiêm ngặt.', icon: SparklesIcon },
];

const trustBadges = ['Xác minh hồ sơ', 'Chứng chỉ điều dưỡng', 'Hồ sơ CCCD rõ ràng'];

const assuranceStats = [
    { value: '1,900+', label: 'gia đình tin dùng' },
    { value: '4.9/5', label: 'điểm hài lòng' },
    { value: '500+', label: 'y tá xác minh' },
];

const testimonials = [
    {
        name: 'Chị Phương Thảo',
        meta: 'Mẹ bé Bắp - Quận 2',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900&auto=format&fit=crop',
        quote: 'Dịch vụ của CareMate thực sự chuyên nghiệp. Y tá rất tận tâm, tay nghề cao. Gia đình mình rất an tâm khi sử dụng dịch vụ tại đây.',
    },
    {
        name: 'Chị Minh Hạnh',
        meta: 'Gói chăm sóc sau sinh',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=900&auto=format&fit=crop',
        quote: 'Mình thích nhất là có thể xem hồ sơ, chứng chỉ và đánh giá trước khi đặt lịch. Mọi thứ rõ ràng nên quyết định rất nhanh.',
    },
    {
        name: 'Anh Quân',
        meta: 'Tư vấn chăm bé',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop',
        quote: 'Gói tư vấn nhanh giúp gia đình xử lý các câu hỏi nhỏ kịp thời mà không cần đưa bé đi xa.',
    },
];

const Home = () => {
    const { t } = useTranslation();
    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start end', 'end start'],
    });
    const heroImageY = useTransform(heroProgress, [0, 1], [0, -120]);

    const stepsRef = useRef(null);
    const { scrollYProgress: stepsProgress } = useScroll({
        target: stepsRef,
        offset: ['start end', 'end start'],
    });
    const stepsBgY = useTransform(stepsProgress, [0, 1], [0, -80]);

    return (
        <div className="overflow-hidden bg-[linear-gradient(120deg,#effff8_0%,#fff_45%,#fff1f8_100%)] text-[#0B1F3A]">
            <section ref={heroRef} className="relative min-h-[88vh] px-6 py-16 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(236,72,153,0.18),transparent_30%),radial-gradient(circle_at_16%_12%,rgba(16,185,129,0.10),transparent_28%),radial-gradient(circle_at_42%_86%,rgba(15,23,42,0.08),transparent_34%)]" />
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-brand/10 pointer-events-none"
                        style={{ width: 6 + i * 4, height: 6 + i * 4, left: `${20 + i * 25}%`, top: `${15 + i * 22}%` }}
                        animate={{ y: [0, -12 - i * 6, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                    />
                ))}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`dot-${i}`}
                        className="absolute w-1.5 h-1.5 bg-brand/20 rounded-full pointer-events-none"
                        style={{ left: `${60 + i * 12}%`, top: `${70 - i * 15}%` }}
                        animate={{ y: [0, -8 - i * 3, 0], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    />
                ))}
                <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_0.8fr]">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="mb-6 text-[10px] font-black uppercase tracking-[0.42em] text-brand"
                        >
                            CareMate • Chăm sóc mẹ bé tại nhà
                        </motion.div>
                        <h1 className="max-w-3xl text-6xl font-black leading-[0.96] tracking-tight text-[#0B1F3A] md:text-8xl">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                Chăm sóc{' '}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                                className="block font-serif italic font-medium text-slate-500"
                            >
                                tại nhà.
                            </motion.span>
                        </h1>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.45 }}
                            className="mt-6 max-w-lg text-xl font-black leading-8 text-slate-800"
                        >
                            Để mẹ được nghỉ ngơi, bé được chăm đúng cách, và gia đình luôn biết bước tiếp theo.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.55 }}
                            className="mt-4 max-w-xl text-base font-semibold leading-[1.75] text-slate-500"
                        >
                            Mang tiêu chuẩn y khoa đến ngôi nhà của bạn. CareMate giúp gia đình đặt lịch y tá, xem hồ sơ, đánh giá và chi phí một cách minh bạch.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.65 }}
                            className="mt-10 flex flex-wrap gap-4"
                        >
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/services" className="block rounded-full bg-[#0B1F3A] px-9 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#0B1F3A]/15 transition hover:bg-brand">
                                    Khám phá dịch vụ
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/find-nurse" className="block rounded-full border border-slate-200 bg-white px-9 py-4 text-xs font-black uppercase tracking-widest text-[#0B1F3A] shadow-sm transition hover:border-brand hover:text-brand">
                                    Tìm y tá
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <div className="relative">
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            style={{ y: heroImageY }}
                            className="relative overflow-hidden rounded-2xl border-[10px] border-white bg-white shadow-2xl shadow-slate-200"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1300&auto=format&fit=crop"
                                alt="Y tá chăm sóc mẹ và bé tại nhà"
                                className="h-[560px] w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/60 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 p-5 backdrop-blur">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-sm font-black text-[#10233F]">{t('home.hero.verifiedNurseProfile')}</div>
                                        <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('home.hero.verifiedDetails')}</div>
                                    </div>
                                    <CheckBadgeIcon className="h-9 w-9 text-emerald-500" />
                                </div>
                            </div>
                        </motion.div>
                        {[
                            { title: 'Điều dưỡng đã xác minh', sub: 'Chứng chỉ + CCCD', icon: CheckBadgeIcon, pos: '-left-5 top-12' },
                            { title: 'Có mặt trong 30 phút', sub: 'Khung giờ gần nhất', icon: BoltIcon, pos: '-right-4 top-44' },
                            { title: 'Phân tích tình trạng sức khỏe', sub: 'Đưa ra gói chăm sóc phù hợp', icon: CpuChipIcon, pos: 'left-8 -bottom-6' },
                        ].map((card, index) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 16, x: index === 1 ? 16 : -16 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                transition={{ delay: 0.35 + index * 0.12 }}
                                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                className={`absolute hidden rounded-2xl border border-white bg-white/90 p-4 shadow-2xl shadow-slate-300/50 backdrop-blur xl:block ${card.pos}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                        <card.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-[#10233F]">{card.title}</div>
                                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.sub}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="relative mx-auto mt-12 grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-xl shadow-slate-200/50 backdrop-blur"
                        >
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                            <div className="mt-2 text-3xl font-black text-[#10233F]">{stat.value}</div>
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-tight text-slate-400">{stat.sub}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="px-6 py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.6 }}
                        className="mb-10 flex items-end justify-between gap-6"
                    >
                        <div>
                            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">Dịch vụ nổi bật</div>
                            <h2 className="text-4xl font-black tracking-tight text-[#10233F]">Dịch vụ cho những ngày gia đình cần thêm một đôi tay.</h2>
                            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-500">Từ chăm sóc sau sinh, tư vấn nhanh đến theo dõi sức khỏe mẹ và bé hằng ngày.</p>
                        </div>
                        <Link to="/services" className="group hidden items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand sm:flex">
                            Xem tất cả{' '}
                            <motion.span
                                animate={{ x: 0 }}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ArrowRightIcon className="h-4 w-4" />
                            </motion.span>
                        </Link>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {featuredServices.map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -32 : 32, y: 32 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.6, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                            >
                                <Link to="/services" className={`group block ${index === 1 ? 'md:mt-16' : index === 2 ? 'md:mt-8' : ''}`}>
                                    <div className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-xl shadow-slate-200/60">
                                        <img src={service.image} alt={service.title} className="h-80 w-full object-cover transition duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/60 via-transparent to-transparent opacity-60 transition group-hover:opacity-85" />
                                        <div className="absolute bottom-5 left-5 translate-y-2 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <div className="text-sm font-black">{service.title}</div>
                                            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/70">{service.price}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm font-black">
                                        <span>{service.title}</span>
                                        <span className="text-slate-400">{service.price}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-24 lg:px-8 bg-gradient-to-tr from-brand/5 via-transparent to-emerald-50/20">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-7xl"
                >
                    <div className="mb-10 max-w-3xl">
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">Tính năng mới cho mẹ sau sinh</div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight text-[#10233F]">
                            Một góc riêng để mẹ <span className="text-brand">gợi ý dịch vụ phù hợp mỗi ngày</span>
                        </h2>
                        <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                            CareMate giúp mẹ ghi lại tình trạng của bản thân và em bé, sau đó AI tóm tắt rủi ro, đưa khuyến nghị và gợi ý dịch vụ hỗ trợ phù hợp ngay lập tức.
                        </p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <HealthCheckInsEntryPage />
                    </motion.div>
                </motion.div>
            </section>

            <section ref={stepsRef} className="relative px-6 py-28 lg:px-8">
                <motion.img
                    style={{ y: stepsBgY }}
                    src="https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?q=80&w=1400&auto=format&fit=crop"
                    alt="Mẹ và bé"
                    className="absolute left-0 top-16 hidden h-[420px] w-[35vw] rounded-r-3xl object-cover opacity-30 lg:block"
                />
                <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1fr]">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                        className="pt-24"
                    >
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">Quy trình dịch vụ</div>
                        <h2 className="max-w-sm text-4xl font-black leading-tight tracking-tight text-[#10233F]">Bắt đầu hành trình an tâm.</h2>
                        <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-slate-500">Chỉ với 4 bước đơn giản để nhận được sự chăm sóc tốt nhất.</p>
                    </motion.div>
                    <div className="space-y-8">
                        {steps.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20, rotateY: index % 2 === 0 ? 2 : -2 }}
                                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                                className="grid grid-cols-[56px_1fr] gap-6"
                            >
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand shadow-lg shadow-slate-200"
                                    >
                                        <item.icon className="h-7 w-7" />
                                    </motion.div>
                                    {index < steps.length - 1 && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            whileInView={{ height: 56 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
                                            className="mt-4 w-px bg-gradient-to-b from-brand/30 to-slate-200"
                                        />
                                    )}
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/60">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.step}</div>
                                    <h3 className="mt-2 text-xl font-black text-[#10233F]">{item.title}</h3>
                                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-24 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-7xl"
                >
                    <h2 className="text-4xl font-black tracking-tight text-[#10233F]">Không gian hỗ trợ của CareMate.</h2>
                    <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">Nơi gia đình tìm cộng đồng, hồ sơ y tá, gói chăm sóc và công cụ gợi ý dịch vụ thông minh.</p>
                    <div className="mt-10 grid auto-rows-[230px] grid-cols-1 gap-5 md:grid-cols-3">
                        {archiveCards.map((card, index) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 40, x: index % 2 === 0 ? -30 : 30, rotate: index % 2 === 0 ? -2 : 2 }}
                                whileInView={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.4, delay: index * 0.06 }}
                                className={index === 0 ? 'md:col-span-2' : ''}
                            >
                                <Link
                                    to={card.link}
                                    className="group relative overflow-hidden rounded-2xl bg-slate-100 shadow-xl shadow-slate-200/50 block h-full"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 transition duration-700 group-hover:opacity-100 z-10 pointer-events-none"></div>
                                    <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/78 via-[#10233F]/20 to-transparent transition duration-500 group-hover:from-brand/80" />
                                    <div className="absolute bottom-6 left-6 right-6 translate-y-1 transition duration-300 group-hover:translate-y-0">
                                        <h3 className="text-xl font-black text-white">{card.title}</h3>
                                        <p className="mt-2 max-w-sm text-xs font-semibold leading-5 text-white/70">{card.desc}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            <section className="px-6 py-28 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.95fr_1fr]">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <motion.div
                            animate={{ y: [0, -12, 0], scale: [1, 1.02, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -inset-8 rounded-full bg-brand/10 blur-3xl"
                        />
                        <div className="relative overflow-hidden rounded-2xl border-[10px] border-white shadow-2xl shadow-slate-200">
                            <img src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1400&auto=format&fit=crop" alt="Expert Nurse" className="h-[560px] w-full object-cover" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">Giá trị cốt lõi</div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight text-[#10233F] lg:text-6xl">Vì sao hàng ngàn mẹ tin chọn CareMate?</h2>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="mt-7 flex flex-wrap gap-3"
                        >
                            {trustBadges.map((badge) => (
                                <span key={badge} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                    ✓ {badge}
                                </span>
                            ))}
                        </motion.div>
                        <div className="mt-7 grid grid-cols-3 gap-3">
                            {assuranceStats.map((item) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.2 }}
                                    className="rounded-2xl bg-white p-4 text-center shadow-lg shadow-slate-200/60"
                                >
                                    <div className="text-xl font-black text-[#10233F]">{item.value}</div>
                                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-12 space-y-8">
                            {values.map((item, index) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -16 : 16, y: 16 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    whileHover={{ x: index % 2 === 0 ? 4 : -4, transition: { duration: 0.2 } }}
                                    className="flex gap-5"
                                >
                                    <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white text-brand shadow-lg shadow-slate-200">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#10233F]">{item.title}</h3>
                                        <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-[linear-gradient(120deg,#effff8_0%,#fff_45%,#fff1f8_100%)] px-6 py-24 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-7xl"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-[#0B2341] p-10 text-white shadow-2xl shadow-slate-200 md:p-16 lg:p-20">
                    <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_52%_18%,rgba(236,72,153,0.18),transparent_28%)]"
                    />
                    <div className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">Chăm sóc tận tâm cho những điều quan trọng nhất.</h2>
                        <p className="mx-auto mt-5 max-w-xl text-sm font-semibold leading-7 text-white/55">Không chỉ là một lịch hẹn, CareMate tạo cảm giác rõ ràng từ lúc chọn dịch vụ đến khi ca chăm sóc hoàn thành.</p>
                    </div>
                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {assuranceStats.map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 24, x: i === 1 ? 0 : (i === 0 ? -16 : 16) }}
                                whileInView={{ opacity: 1, y: 0, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                                whileHover={{ scale: 1.04, y: -4, transition: { duration: 0.2 } }}
                                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center"
                            >
                                <div className="text-3xl font-black">{item.value}</div>
                                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/35">{item.label}</div>
                            </motion.div>
                        ))}
                    </div>
                    <h3 className="mt-16 text-center text-4xl font-semibold italic text-white/80">Khách hàng nói gì.</h3>
                    <div className="mt-14 grid gap-5 md:grid-cols-3">
                        {testimonials.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 24, x: index === 1 ? 0 : (index === 0 ? -20 : 20) }}
                                whileInView={{ opacity: 1, y: 0, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className={`rounded-2xl border border-white/10 bg-white/[0.04] p-6 ${index === 1 ? 'md:mt-14' : index === 2 ? 'md:mt-28' : ''}`}
                            >
                                <div className="mb-5 flex text-yellow-300">
                                    {Array.from({ length: 5 }).map((_, star) => <StarSolid key={star} className="h-4 w-4" />)}
                                </div>
                                <p className="min-h-32 text-sm font-semibold leading-7 text-white/70">"{item.quote}"</p>
                                <div className="mt-8 flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-2xl object-cover" />
                                    <div>
                                        <div className="text-sm font-black">{item.name}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">{item.meta}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    </div>
                    </div>
                </motion.div>
            </section>

            <section className="bg-[linear-gradient(120deg,#effff8_0%,#fff_45%,#fff1f8_100%)] px-6 py-24 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#0B2341] text-center text-white shadow-2xl shadow-slate-200"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative p-10 md:p-16"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1800&auto=format&fit=crop"
                            alt="Gia đình và em bé"
                            className="absolute inset-0 h-full w-full object-cover opacity-35"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#10233F]/90 via-[#10233F]/55 to-[#10233F]/90" />
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative mx-auto max-w-2xl"
                        >
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <EnvelopeIcon className="mx-auto h-10 w-10 text-brand" />
                            </motion.div>
                            <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">Nhận kiến thức hữu ích từ chuyên gia</h2>
                            <motion.form
                                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="mt-8 flex flex-col gap-3 rounded-full border border-white/10 bg-white/10 p-2 backdrop-blur sm:flex-row"
                            >
                                <input type="email" placeholder="Nhập email của bạn..." className="min-w-0 flex-1 rounded-full border-none bg-transparent px-5 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40" />
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="rounded-full bg-[#EC4899] px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20"
                                >
                                    Nhận cẩm nang chăm sóc
                                </motion.button>
                            </motion.form>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
