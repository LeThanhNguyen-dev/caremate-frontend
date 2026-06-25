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



const Home = () => {
    const { t } = useTranslation();

    const featuredServices = [
        { title: t('home.services.postpartum'), price: t('home.services.atHome'), image: '/assets/images/service-1.jpg' },
        { title: t('home.services.quickConsult'), price: t('home.services.15min'), image: '/assets/images/service-3.jpg' },
        { title: t('home.services.monitoring'), price: t('home.services.aiCheckin'), image: '/assets/images/service-2.jpg' },
    ];

    const steps = [
        { step: '01', title: t('home.steps.selectService'), desc: t('home.steps.selectServiceDesc'), icon: CursorArrowRaysIcon },
        { step: '02', title: t('home.steps.findNurse'), desc: t('home.steps.findNurseDesc'), icon: UserPlusIcon },
        { step: '03', title: t('home.steps.bookAppointment'), desc: t('home.steps.bookAppointmentDesc'), icon: CalendarDaysIcon },
        { step: '04', title: t('home.steps.enjoyCare'), desc: t('home.steps.enjoyCareDesc'), icon: HandRaisedIcon },
    ];

    const archiveCards = [
        { title: t('home.archive.community'), desc: t('home.archive.communityDesc'), image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop', link: '/community' },
        { title: t('home.archive.medicalStandards'), desc: t('home.archive.medicalStandardsDesc'), image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1400&auto=format&fit=crop', link: '/about' },
        { title: t('home.archive.longTermPackages'), desc: t('home.archive.longTermPackagesDesc'), image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1400&auto=format&fit=crop', link: '/services' },
        { title: t('home.archive.nurseProfiles'), desc: t('home.archive.nurseProfilesDesc'), image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1400&auto=format&fit=crop', link: '/find-nurse' },
        { title: t('home.archive.healthCheckins'), desc: t('home.archive.healthCheckinsDesc'), image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?q=80&w=1400&auto=format&fit=crop', link: '/health-checkins' },
    ];

    const valuesData = [
        { title: t('home.values.professionalNurses'), desc: t('home.values.professionalNursesDesc'), icon: ShieldCheckIcon },
        { title: t('home.values.dedicatedService'), desc: t('home.values.dedicatedServiceDesc'), icon: HeartIcon },
        { title: t('home.values.transparentSafe'), desc: t('home.values.transparentSafeDesc'), icon: SparklesIcon },
    ];

    const trustBadges = [t('home.badges.verifiedProfile'), t('home.badges.nursingCertificate'), t('home.badges.clearId')];

    const assuranceStats = [
        { value: '1,900+', label: t('home.assurance.families') },
        { value: '4.9/5', label: t('home.assurance.satisfaction') },
        { value: '500+', label: t('home.assurance.verifiedNurses') },
    ];

    const testimonials = [
        { name: t('home.testimonials.name1'), meta: t('home.testimonials.meta1'), image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900&auto=format&fit=crop', quote: t('home.testimonials.quote1') },
        { name: t('home.testimonials.name2'), meta: t('home.testimonials.meta2'), image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=900&auto=format&fit=crop', quote: t('home.testimonials.quote2') },
        { name: t('home.testimonials.name3'), meta: t('home.testimonials.meta3'), image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop', quote: t('home.testimonials.quote3') },
    ];

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
                            {t('home.hero.subtitle')}
                        </motion.div>
                        <h1 className="max-w-3xl text-6xl font-black leading-[0.96] tracking-tight text-[#0B1F3A] md:text-8xl">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                {t('home.hero.title')}{' '}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                                className="block font-serif italic font-medium text-slate-500"
                            >
                                {t('home.hero.titleHighlight')}
                            </motion.span>
                        </h1>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.45 }}
                            className="mt-6 max-w-lg text-xl font-black leading-8 text-slate-800"
                        >
                            {t('home.hero.description')}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.55 }}
                            className="mt-4 max-w-xl text-base font-semibold leading-[1.75] text-slate-500"
                        >
                            {t('home.hero.subtext')}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.65 }}
                            className="mt-10 flex flex-wrap gap-4"
                        >
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/services" className="block rounded-full bg-[#0B1F3A] px-9 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#0B1F3A]/15 transition hover:bg-brand">
                                    {t('home.hero.exploreServices')}
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Link to="/find-nurse" className="block rounded-full border border-slate-200 bg-white px-9 py-4 text-xs font-black uppercase tracking-widest text-[#0B1F3A] shadow-sm transition hover:border-brand hover:text-brand">
                                    {t('home.hero.findNurse')}
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
                                src="/assets/images/hero.jpeg"
                                alt={t('home.hero.subtitle')}
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
                            { title: t('home.hero.tag1'), sub: t('home.hero.tag1Sub'), icon: CheckBadgeIcon, pos: '-left-5 top-12' },
                            { title: t('home.hero.tag2'), sub: t('home.hero.tag2Sub'), icon: BoltIcon, pos: '-right-4 top-44' },
                            { title: t('home.hero.tag3'), sub: t('home.hero.tag3Sub'), icon: CpuChipIcon, pos: 'left-8 -bottom-6' },
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
                            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">{t('home.featured.label')}</div>
                            <h2 className="text-4xl font-black tracking-tight text-[#10233F]">{t('home.featured.title')}</h2>
                            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-500">{t('home.featured.desc')}</p>
                        </div>
                        <Link to="/services" className="group hidden items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand sm:flex">
                            {t('home.featured.viewAll')}{' '}
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
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">{t('home.health.label')}</div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight text-[#10233F]" dangerouslySetInnerHTML={{ __html: t('home.health.title') }}>
                        </h2>
                        <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                            {t('home.health.desc')}
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
                <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1fr]">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl shadow-2xl flex flex-col justify-end p-10 min-h-[500px]"
                    >
                        <motion.img
                            style={{ y: stepsBgY }}
                            src="/assets/images/home-steps.jpg"
                            alt="Quy trình dịch vụ CareMate"
                            className="absolute left-0 -top-[100px] h-[calc(100%+200px)] w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/95 via-[#0B1F3A]/30 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10 pt-32">
                            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-pink-400 drop-shadow-md">{t('home.stepsSection.label')}</div>
                            <h2 className="max-w-sm text-4xl font-black leading-tight tracking-tight text-white drop-shadow-md">{t('home.stepsSection.title')}</h2>
                            <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-white/80 drop-shadow-md">{t('home.stepsSection.desc')}</p>
                        </div>
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
                    <h2 className="text-4xl font-black tracking-tight text-[#10233F]">{t('home.archiveSection.title')}</h2>
                    <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">{t('home.archiveSection.desc')}</p>
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
                            <img src="/assets/images/service-4.jpg" alt="Expert Nurse" className="h-[560px] w-full object-cover" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">{t('home.valuesSection.label')}</div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight text-[#10233F] lg:text-6xl">{t('home.valuesSection.title')}</h2>
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
                            {valuesData.map((item, index) => (
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
                            <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">{t('home.newsletter.title')}</h2>
                            <motion.form
                                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="mt-8 flex flex-col gap-3 rounded-full border border-white/10 bg-white/10 p-2 backdrop-blur sm:flex-row"
                            >
                                <input type="email" placeholder={t('home.newsletter.placeholder')} className="min-w-0 flex-1 rounded-full border-none bg-transparent px-5 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40" />
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="rounded-full bg-[#EC4899] px-8 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20"
                                >
                                    {t('home.newsletter.button')}
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
