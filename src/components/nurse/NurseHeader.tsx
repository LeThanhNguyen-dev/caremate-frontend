import { PlusIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from '../NotificationDropdown';
import { useAuth } from '../../hooks/useAuth';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
    '/nurse/overview': {
        title: 'Bang dieu khien',
        subtitle: 'Theo doi tong quan cong viec va hieu suat cham soc cua ban.',
    },
    '/nurse/schedule': {
        title: 'Lich lam viec',
        subtitle: 'Quan ly thoi gian bieu va cac khung gio phuc vu khach hang.',
    },
    '/nurse/bookings': {
        title: 'Quan ly lich hen',
        subtitle: 'Xu ly cac yeu cau dat lich va theo doi tien do cong viec.',
    },
    '/nurse/services': {
        title: 'Dich vu cua toi',
        subtitle: 'Tuy chinh danh muc dich vu va muc gia chuyen mon cua ban.',
    },
    '/nurse/profile': {
        title: 'Ho so chuyen mon',
        subtitle: 'Cap nhat thong tin ca nhan va chung chi hanh nghe.',
    },
    '/nurse/notifications': {
        title: 'Thong bao',
        subtitle: 'Theo doi cac cap nhat moi nhat ve lich hen, thanh toan va danh gia.',
    },
};

const NurseHeader = () => {
    const location = useLocation();
    const { user } = useAuth();
    const meta = pageMeta[location.pathname] ?? {
        title: 'Khong gian y te',
        subtitle: 'Chao mung ban quay tro lai voi cong viec cham soc tan tam.',
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-50 bg-white/80 px-8 py-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981] shadow-sm">
                        Kenh dieu duong chuyen nghiep
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">{meta.title}</h1>
                    <p className="mt-1 text-sm font-medium text-slate-500">{meta.subtitle}</p>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationDropdown
                        key={location.pathname}
                        accentClassName="bg-emerald-50 text-[#10B981]"
                        badgeClassName="bg-[#10B981]"
                        buttonClassName="group relative rounded-lg bg-slate-50 p-3 text-slate-400 transition-all hover:bg-emerald-50 hover:text-[#10B981]"
                        emptyIconClassName="text-emerald-100"
                        alignClassName="right-0"
                    />

                    <button className="flex items-center gap-2 rounded-lg bg-[#10B981] px-8 py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95">
                        <PlusIcon className="h-4 w-4" />
                        Cai dat lich
                    </button>

                    <div className="hidden items-center gap-3 border-l border-slate-100 pl-4 xl:flex">
                        <div className="text-right">
                            <div className="text-xs font-black text-slate-900">{user?.username}</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-[#10B981]">
                                Vai tro: Dieu duong
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NurseHeader;
