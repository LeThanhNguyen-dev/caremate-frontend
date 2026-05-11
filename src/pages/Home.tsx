import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    HeartIcon,
    ShieldCheckIcon, 
    PlayIcon,
    SparklesIcon,
    CheckBadgeIcon,
    EnvelopeIcon,
    CursorArrowRaysIcon,
    UserPlusIcon,
    CalendarDaysIcon,
    HandRaisedIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const Home = () => {
    return (
        <div className="bg-white">
            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex flex-col pt-20">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://i.pinimg.com/1200x/6a/eb/fb/6aebfbce0394d166834f2ad0c8665df1.jpg" 
                        alt="Hero" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 flex-1 flex flex-col justify-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-brand mb-6">CareMate • Premium Care System</div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.3] mb-8">
                            Dịch vụ chăm sóc <br /> 
                            <span className="text-brand">tận tâm</span> cho tổ ấm
                        </h1>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl">
                            Mang tiêu chuẩn y khoa cao cấp nhất đến ngay ngôi nhà của bạn. 
                            Chúng tôi đồng hành cùng gia đình bạn trong mọi khoảnh khắc quý giá.
                        </p>
                        <div className="flex flex-wrap gap-6 items-center">
                            <Link to="/services" className="btn-primary !px-12 !py-5 text-sm shadow-2xl shadow-pink-500/20">
                                Khám phá dịch vụ
                            </Link>
                            <button className="flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-full border-2 border-brand flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all">
                                    <PlayIcon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Xem giới thiệu</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Stats */}
                <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 -mb-16 mt-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Khách hàng', value: '1,900+', sub: 'Gia đình tin tưởng' },
                            { label: 'Y tá chuyên môn', value: '500+', sub: 'Xác minh 100%' },
                            { label: 'Hài lòng', value: '99%', sub: 'Đánh giá tích cực' },
                            { label: 'Đánh giá', value: '4.9/5', sub: 'Sao trung bình' },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/90 backdrop-blur-xl p-6 rounded-lg border border-white shadow-xl shadow-slate-200/50"
                            >
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                                <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{stat.sub}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION (REPLACED) */}
            <section className="py-40 bg-white relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <div className="accent-label mx-auto">Quy trình dịch vụ</div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Bắt đầu hành trình <span className="text-brand">an tâm</span></h2>
                        <p className="text-slate-500 font-medium">Chỉ với 4 bước đơn giản để nhận được sự chăm sóc tốt nhất.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { step: '01', title: 'Chọn dịch vụ', desc: 'Duyệt qua danh mục dịch vụ chăm sóc đa dạng từ CareMate.', icon: CursorArrowRaysIcon },
                            { step: '02', title: 'Tìm y tá ưng ý', desc: 'Xem hồ sơ, kinh nghiệm và đánh giá thực tế của y tá.', icon: UserPlusIcon },
                            { step: '03', title: 'Đặt lịch hẹn', desc: 'Lựa chọn thời gian phù hợp với lịch sinh hoạt của gia đình.', icon: CalendarDaysIcon },
                            { step: '04', title: 'Tận hưởng chăm sóc', desc: 'Điều dưỡng đến nhà thực hiện quy trình chuyên môn.', icon: HandRaisedIcon },
                        ].map((item, i) => (
                            <div key={i} className="relative p-10 rounded-xl bg-slate-50 hover:bg-brand-soft transition-colors group">
                                <div className="absolute top-6 right-8 text-5xl font-black text-slate-900/10 group-hover:text-brand/20 transition-colors">{item.step}</div>
                                <div className="h-14 w-14 rounded-lg bg-white shadow-sm flex items-center justify-center text-brand mb-8 group-hover:scale-110 transition-transform">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-4">{item.title}</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REPLACED DOUBLE BANNER SECTION */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 grid md:grid-cols-2 gap-8">
                    {[
                        { title: 'Cộng đồng CareMate', desc: 'Tham gia thảo luận và chia sẻ kinh nghiệm cùng hàng ngàn mẹ bỉm.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2064&auto=format&fit=crop', link: '/community' },
                        { title: 'Tiêu chuẩn Y khoa', desc: 'Tìm hiểu về quy trình đào tạo và kiểm soát chất lượng tại CareMate.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop', link: '/about' },
                    ].map((banner, i) => (
                        <div key={i} className="relative h-[450px] rounded-xl overflow-hidden group border-8 border-slate-50">
                            <img src={banner.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-12">
                                <h3 className="text-3xl font-black text-white mb-4">{banner.title}</h3>
                                <p className="text-white/70 text-sm font-medium mb-8 max-w-sm">{banner.desc}</p>
                                <Link to={banner.link} className="btn-primary !w-fit !bg-white !text-slate-900 hover:!bg-brand hover:!text-white border-none shadow-none">Khám phá ngay</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY CHOOSE US (REFINED PHOTO FIT) */}
            <section className="py-40 bg-slate-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="absolute -inset-10 bg-brand/5 blur-[100px] rounded-full"></div>
                            <div className="relative rounded-xl overflow-hidden border-[12px] border-white shadow-2xl aspect-square">
                                <img 
                                    src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop" 
                                    alt="Expert Nurse" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 luxury-card !p-6 shadow-2xl border-none hidden md:block">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-brand text-white flex items-center justify-center">
                                        <CheckBadgeIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-slate-900">100% Chuyên gia</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đã qua đào tạo khắt khe</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="accent-label">Giá trị cốt lõi</div>
                            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-10 leading-[1.3]">Vì sao hàng ngàn <br /> mẹ tin chọn <span className="text-brand">CareMate?</span></h2>
                            <div className="space-y-12">
                                {[
                                    { title: 'Y tá chuyên nghiệp', desc: '100% điều dưỡng có bằng cấp và chứng chỉ hành nghề chính quy.', icon: ShieldCheckIcon },
                                    { title: 'Dịch vụ tận tâm', desc: 'Luôn lắng nghe và chăm sóc mẹ bé như người thân trong gia đình.', icon: HeartIcon },
                                    { title: 'Minh bạch & An toàn', desc: 'Giá cả công khai, hồ sơ y tá được kiểm định nghiêm ngặt.', icon: SparklesIcon }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="h-14 w-14 rounded-lg bg-white shadow-md flex items-center justify-center text-brand flex-none">
                                            <item.icon className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 mb-2">{item.title}</h4>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section className="py-40 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">Khách hàng nói gì về chúng tôi</h2>
                        <p className="text-slate-500 font-medium">"Sự hài lòng của gia đình bạn là sứ mệnh của chúng tôi"</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-slate-50 p-12 rounded-xl flex flex-col md:flex-row gap-8 items-start hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <img src={i === 1 ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop" : "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"} className="h-24 w-24 rounded-xl object-cover flex-none shadow-lg" />
                                <div>
                                    <div className="flex text-yellow-400 mb-6"><StarSolid className="h-4 w-4" /><StarSolid className="h-4 w-4" /><StarSolid className="h-4 w-4" /><StarSolid className="h-4 w-4" /><StarSolid className="h-4 w-4" /></div>
                                    <p className="text-slate-600 font-medium leading-relaxed mb-8 italic">"Dịch vụ của CareMate thực sự chuyên nghiệp. Y tá rất tận tâm, tay nghề cao. Gia đình mình rất an tâm khi sử dụng dịch vụ tại đây."</p>
                                    <div className="font-black text-slate-900 text-sm">Chị Phương Thảo</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mẹ bé Bắp - Quận 2</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEWSLETTER SECTION */}
            <section className="py-40 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="bg-slate-900 rounded-xl p-12 lg:p-24 relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/10 blur-[120px] -mr-64 -mt-64 rounded-full"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="h-20 w-20 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-10">
                                <EnvelopeIcon className="h-10 w-10 text-brand" />
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-black text-white mb-10 leading-tight">Nhận kiến thức hữu ích từ chuyên gia</h2>
                            <form className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xl">
                                <input type="email" placeholder="Nhập email của bạn..." className="flex-1 bg-transparent border-none rounded-lg px-6 py-4 text-white font-bold outline-none placeholder:text-white/30" />
                                <button className="btn-primary !px-12 !rounded-lg">Đăng ký ngay</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;





