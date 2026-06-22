import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { useTranslation } from 'react-i18next';
import HealthCheckInsEntryPage from './HealthCheckInsEntryPage';

const Home = () => {
    const { t } = useTranslation();

    const stats = [
        { label: t('home.stats.customers'), value: '1,900+', sub: t('home.stats.families') },
        { label: t('home.stats.nurses'), value: '500+', sub: t('home.stats.verified') },
        { label: t('home.stats.satisfied'), value: '99%', sub: t('home.stats.positiveReviews') },
        { label: t('home.stats.rating'), value: '4.9/5', sub: t('home.stats.avgStars') },
    ];

    const featuredServices = [
        {
            title: t('home.services.postpartum'),
            price: t('home.services.atHome'),
            image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1200&auto=format&fit=crop',
        },
        {
            title: t('home.services.quickConsult'),
            price: t('home.services.15min'),
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
        },
        {
            title: t('home.services.monitoring'),
            price: t('home.services.aiCheckin'),
            image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1200&auto=format&fit=crop',
        },
    ];

    const steps = [
        { step: '01', title: t('home.steps.selectService'), desc: t('home.steps.selectServiceDesc'), icon: CursorArrowRaysIcon },
        { step: '02', title: t('home.steps.findNurse'), desc: t('home.steps.findNurseDesc'), icon: UserPlusIcon },
        { step: '03', title: t('home.steps.bookAppointment'), desc: t('home.steps.bookAppointmentDesc'), icon: CalendarDaysIcon },
        { step: '04', title: t('home.steps.enjoyCare'), desc: t('home.steps.enjoyCareDesc'), icon: HandRaisedIcon },
    ];

    const archiveCards = [
        {
            title: t('home.archive.community'),
            desc: t('home.archive.communityDesc'),
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop',
            link: '/community',
        },
        {
            title: t('home.archive.medicalStandards'),
            desc: t('home.archive.medicalStandardsDesc'),
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1400&auto=format&fit=crop',
            link: '/about',
        },
        {
            title: t('home.archive.longTermPackages'),
            desc: t('home.archive.longTermPackagesDesc'),
            image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1400&auto=format&fit=crop',
            link: '/services',
        },
        {
            title: t('home.archive.nurseProfiles'),
            desc: t('home.archive.nurseProfilesDesc'),
            image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1400&auto=format&fit=crop',
            link: '/find-nurse',
        },
        {
            title: t('home.archive.healthCheckins'),
            desc: t('home.archive.healthCheckinsDesc'),
            image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?q=80&w=1400&auto=format&fit=crop',
            link: '/health-checkins',
        },
    ];

    const values = [
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
    {
        nameKey: 'home.testimonials.name1',
        metaKey: 'home.testimonials.meta1',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900&auto=format&fit=crop',
        quoteKey: 'home.testimonials.quote1',
    },
    {
        nameKey: 'home.testimonials.name2',
        metaKey: 'home.testimonials.meta2',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=900&auto=format&fit=crop',
        quoteKey: 'home.testimonials.quote2',
    },
    {
        nameKey: 'home.testimonials.name3',
        metaKey: 'home.testimonials.meta3',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop',
        quoteKey: 'home.testimonials.quote3',
    },
];
    return (
        <div className="overflow-hidden bg-transparent text-[#0B1F3A]">
            <section className="relative min-h-[88vh] px-6 py-16 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(236,72,153,0.18),transparent_30%),radial-gradient(circle_at_16%_12%,rgba(16,185,129,0.10),transparent_28%),radial-gradient(circle_at_42%_86%,rgba(15,23,42,0.08),transparent_34%)]" />
                <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_0.8fr]">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
                        <div className="accent-label">{t('home.hero.subtitle')}</div>
                        <h1 className="max-w-3xl text-6xl font-black leading-[0.96] tracking-tight text-[#0B1F3A] md:text-8xl">
                            {t('home.hero.title')}
                            <span className="block font-serif italic font-medium text-slate-500">{t('home.hero.titleHighlight')}</span>
                        </h1>
                        <p className="mt-6 max-w-lg text-xl font-black leading-8 text-slate-800">
                            {t('home.hero.description')}
                        </p>
                        <p className="mt-4 max-w-xl text-base font-semibold leading-[1.75] text-slate-500">
                            {t('home.hero.subtext')}
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link to="/services" className="btn-primary">
                                {t('home.hero.exploreServices')}
                            </Link>
                            <Link to="/find-nurse" className="btn-secondary">
                                {t('home.hero.findNurse')}
                            </Link>
                        </div>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="relative overflow-hidden rounded-2xl border-[10px] border-white bg-white shadow-2xl shadow-slate-200"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1300&auto=format&fit=crop"
                                alt="Y tá chăm sóc mẹ và bé tại nhà"
                                className="h-[560px] w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/60 via-transparent to-transparent" />
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
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 + index * 0.12 }}
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
                            className="luxury-card"
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
                    <div className="mb-10 flex items-end justify-between gap-6">
                        <div>
                            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">{t('home.featured.label')}</div>
                            <h2 className="text-4xl font-black tracking-tight text-[#10233F]">{t('home.featured.title')}</h2>
                            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-500">{t('home.featured.desc')}</p>
                        </div>
                        <Link to="/services" className="hidden items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand sm:flex">
                            {t('home.featured.viewAll')} <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {featuredServices.map((service, index) => (
                            <Link key={service.title} to="/services" className={`group ${index === 1 ? 'md:mt-16' : index === 2 ? 'md:mt-8' : ''}`}>
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
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 max-w-3xl">
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">{t('home.health.label')}</div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight text-[#10233F]" dangerouslySetInnerHTML={{ __html: t('home.health.title') }}></h2>
                        <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                            {t('home.health.desc')}
                        </p>
                    </div>
                    <HealthCheckInsEntryPage />
                </div>
            </section>

            <section className="relative px-6 py-28 lg:px-8">
                <img
                    src="https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?q=80&w=1400&auto=format&fit=crop"
                    alt="Mẹ và bé"
                    className="absolute left-0 top-16 hidden h-[420px] w-[35vw] rounded-r-3xl object-cover opacity-30 lg:block"
                />
                <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1fr]">
                    <div className="pt-24">
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">{t('home.stepsSection.label')}</div>
                        <h2 className="max-w-sm text-4xl font-black leading-tight tracking-tight text-[#10233F]">{t('home.stepsSection.title')}</h2>
                        <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-slate-500">{t('home.stepsSection.desc')}</p>
                    </div>
                    <div className="space-y-8">
                        {steps.map((item, index) => (
                            <div key={item.title} className="grid grid-cols-[56px_1fr] gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand shadow-lg shadow-slate-200">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    {index < steps.length - 1 && <div className="mt-4 h-14 w-px bg-slate-200" />}
                                </div>
                                <div className="luxury-card">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.step}</div>
                                    <h3 className="mt-2 text-xl font-black text-[#10233F]">{item.title}</h3>
                                    <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-4xl font-black tracking-tight text-[#10233F]">{t('home.archiveSection.title')}</h2>
                    <p className="mt-3 max-w-md text-sm font-semibold leading-7 text-slate-500">{t('home.archiveSection.desc')}</p>
                    <div className="mt-10 grid auto-rows-[230px] grid-cols-1 gap-5 md:grid-cols-3">
                        {archiveCards.map((card, index) => (
                            <Link
                                key={card.title}
                                to={card.link}
                                className={`group relative overflow-hidden rounded-2xl bg-slate-100 shadow-xl shadow-slate-200/50 ${index === 0 ? 'md:col-span-2' : ''}`}
                            >
                                <img src={card.image} alt={card.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#10233F]/78 via-[#10233F]/20 to-transparent transition group-hover:from-brand/80" />
                                <div className="absolute bottom-6 left-6 right-6 translate-y-1 transition duration-300 group-hover:translate-y-0">
                                    <h3 className="text-xl font-black text-white">{card.title}</h3>
                                    <p className="mt-2 max-w-sm text-xs font-semibold leading-5 text-white/70">{card.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-28 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.95fr_1fr]">
                    <div className="relative">
                        <div className="absolute -inset-8 rounded-full bg-brand/10 blur-3xl" />
                        <div className="relative overflow-hidden rounded-2xl border-[10px] border-white shadow-2xl shadow-slate-200">
                            <img src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=1400&auto=format&fit=crop" alt="Expert Nurse" className="h-[560px] w-full object-cover" />
                        </div>
                    </div>
                    <div>
                        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-brand">{t('home.valuesSection.label')}</div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight text-[#10233F] lg:text-6xl">{t('home.valuesSection.title')}</h2>
                        <div className="mt-7 flex flex-wrap gap-3">
                            {trustBadges.map((badge) => (
                                <span key={badge} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                    ✓ {badge}
                                </span>
                            ))}
                        </div>
                        <div className="mt-7 grid grid-cols-3 gap-3">
                            {assuranceStats.map((item) => (
                                <div key={item.label} className="luxury-card p-4 text-center">
                                    <div className="text-xl font-black text-[#10233F]">{item.value}</div>
                                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 space-y-8">
                            {values.map((item) => (
                                <div key={item.title} className="flex gap-5">
                                    <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white text-brand shadow-lg shadow-slate-200">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[#10233F]">{item.title}</h3>
                                        <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[linear-gradient(120deg,#effff8_0%,#fff_45%,#fff1f8_100%)] px-6 py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="relative overflow-hidden rounded-2xl bg-[#0B2341] p-10 text-white shadow-2xl shadow-slate-200 md:p-16 lg:p-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_18%,rgba(236,72,153,0.18),transparent_28%)]" />
                    <div className="relative">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">{t('home.testimonialsSection.title')}</h2>
                        <p className="mx-auto mt-5 max-w-xl text-sm font-semibold leading-7 text-white/55">{t('home.testimonialsSection.desc')}</p>
                    </div>
                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {assuranceStats.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
                                <div className="text-3xl font-black">{item.value}</div>
                                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/35">{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <h3 className="mt-16 text-center text-4xl font-semibold italic text-white/80">{t('home.testimonialsSection.header')}</h3>
                    <div className="mt-14 grid gap-5 md:grid-cols-3">
                        {testimonials.map((item, index) => {
                            const itemName = t(item.nameKey);
                            const itemMeta = t(item.metaKey);
                            const itemQuote = t(item.quoteKey);
                            return (
                                <motion.div
                                    key={item.nameKey}
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08 }}
                                    className={`rounded-2xl border border-white/10 bg-white/[0.04] p-6 ${index === 1 ? 'md:mt-14' : index === 2 ? 'md:mt-28' : ''}`}
                                >
                                    <div className="mb-5 flex text-yellow-300">
                                        {Array.from({ length: 5 }).map((_, star) => <StarSolid key={star} className="h-4 w-4" />)}
                                    </div>
                                    <p className="min-h-32 text-sm font-semibold leading-7 text-white/70">"{itemQuote}"</p>
                                    <div className="mt-8 flex items-center gap-4">
                                        <img src={item.image} alt={itemName} className="h-12 w-12 rounded-2xl object-cover" />
                                        <div>
                                            <div className="text-sm font-black">{itemName}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">{itemMeta}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    </div>
                    </div>
                </div>
            </section>

            <section className="bg-[linear-gradient(120deg,#effff8_0%,#fff_45%,#fff1f8_100%)] px-6 py-24 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#0B2341] text-center text-white shadow-2xl shadow-slate-200">
                    <div className="relative p-10 md:p-16">
                        <img
                            src="https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1800&auto=format&fit=crop"
                            alt="Gia đình và em bé"
                            className="absolute inset-0 h-full w-full object-cover opacity-35"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#10233F]/90 via-[#10233F]/55 to-[#10233F]/90" />
                        <div className="relative mx-auto max-w-2xl">
                            <EnvelopeIcon className="mx-auto h-10 w-10 text-brand" />
                            <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">{t('home.newsletter.title')}</h2>
                            <form className="mt-8 flex flex-col gap-3 rounded-full border border-white/10 bg-white/10 p-2 backdrop-blur sm:flex-row">
                                <input type="email" placeholder={t('home.newsletter.placeholder')} className="min-w-0 flex-1 rounded-full border-none bg-transparent px-5 py-3 text-sm font-bold text-white outline-none placeholder:text-white/40" />
                                <button className="btn-primary">{t('home.newsletter.button')}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
