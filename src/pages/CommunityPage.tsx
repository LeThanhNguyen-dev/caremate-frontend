import { motion } from 'framer-motion';
import { 
    ChatBubbleLeftRightIcon, 
    HandThumbUpIcon, 
    ShareIcon, 
    PlusIcon,
    MagnifyingGlassIcon,
    FireIcon
} from '@heroicons/react/24/outline';


const posts = [
    {
        id: 1,
        author: 'Mẹ Bỉm Sữa',
        role: 'Thành viên thân thiết',
        avatar: 'M',
        time: '2 giờ trước',
        title: 'Kinh nghiệm chăm sóc bé sơ sinh vào mùa hè ☀️',
        content: 'Chào các mẹ, hè này nóng quá bé nhà mình hay bị rôm sảy. Có mẹ nào có bí kíp gì không ạ? Mình đã thử tắm lá kinh giới nhưng chưa đỡ lắm...',
        likes: 124,
        comments: 45,
        tags: ['#SơSinh', '#ChămSócBé', '#MùaHè']
    },
    {
        id: 2,
        author: 'Điều dưỡng Phương',
        role: 'Chuyên gia CareMate',
        avatar: 'P',
        time: '5 giờ trước',
        title: 'Chế độ dinh dưỡng cho mẹ sau sinh mổ 🍲',
        content: 'Việc hồi phục sau sinh mổ cần một chế độ dinh dưỡng giàu đạm và vitamin C. Dưới đây là thực đơn gợi ý cho các mẹ trong 7 ngày đầu tiên...',
        likes: 890,
        comments: 156,
        tags: ['#SauSinh', '#DinhDưỡng', '#ChuyênGia']
    },
    {
        id: 3,
        author: 'Bố Trẻ Con',
        role: 'Thành viên mới',
        avatar: 'B',
        time: '1 ngày trước',
        title: 'Lần đầu làm bố và những "cú sốc" ngọt ngào 🍼',
        content: 'Chưa bao giờ mình nghĩ việc thay tã lại có thể trở thành một kỹ năng sinh tồn thực thụ. Cảm ơn CareMate đã đồng hành cùng hai cha con!',
        likes: 45,
        comments: 12,
        tags: ['#LàmBố', '#CảmXúc', '#CareMate']
    }
];

const CommunityPage = () => {
    return (
        <div className="bg-[#FDF2F8]/30 min-h-screen pb-20 pt-20">
            {/* Header */}
            <section className="bg-white border-b border-slate-100 py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="accent-label">Cộng đồng CareMate</div>
                            <h1 className="mt-4 text-4xl font-black text-slate-900">Chia sẻ & Kết nối</h1>
                            <p className="mt-2 text-sm font-bold text-slate-500">Nơi trao đổi kinh nghiệm và lan tỏa yêu thương giữa các gia đình.</p>
                        </div>
                        <button className="btn-primary !px-8 !py-4 rounded-xl shadow-xl shadow-brand/20 flex items-center gap-3 w-fit">
                            <PlusIcon className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tạo bài viết mới</span>
                        </button>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 grid lg:grid-cols-[1fr_0.4fr] gap-12">
                {/* Main Feed */}
                <main className="space-y-8">
                    <div className="luxury-card p-4 flex gap-4 border-none shadow-sm bg-white/50 backdrop-blur-xl">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input type="text" placeholder="Tìm kiếm bài viết, chủ đề..." className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand/20" />
                        </div>
                        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Tìm</button>
                    </div>

                    {posts.map((post, idx) => (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="luxury-card p-8 border-none shadow-xl bg-white hover:shadow-2xl transition-all"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-xl">{post.avatar}</div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">{post.author}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.role} • {post.time}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-tighter">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-4">{post.title}</h2>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-8">{post.content}</p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex gap-6">
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors">
                                        <HandThumbUpIcon className="h-5 w-5" />
                                        <span className="text-xs font-black">{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors">
                                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                        <span className="text-xs font-black">{post.comments}</span>
                                    </button>
                                </div>
                                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <ShareIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </main>

                {/* Sidebar */}
                <aside className="space-y-8">
                    <div className="luxury-card p-8 border-none shadow-xl bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <FireIcon className="h-6 w-6 text-orange-500" />
                            <h3 className="text-lg font-black text-slate-900">Chủ đề hot</h3>
                        </div>
                        <div className="space-y-4">
                            {['Chăm sóc sơ sinh', 'Dinh dưỡng sau sinh', 'Sức khỏe tinh thần', 'Review điều dưỡng'].map((topic, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <span className="text-sm font-bold text-slate-600 group-hover:text-brand">{topic}</span>
                                    <span className="text-[10px] font-black text-slate-300">+{Math.floor(Math.random() * 100)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="luxury-card p-8 border-none shadow-xl bg-brand text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                        <h3 className="text-lg font-black mb-4 relative z-10">CareMate Premium</h3>
                        <p className="text-xs font-medium text-white/70 leading-relaxed mb-6 relative z-10">
                            Nâng cấp gói thành viên để được tư vấn trực tiếp cùng chuyên gia 24/7.
                        </p>
                        <button className="w-full py-3 bg-white text-brand rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/5 relative z-10">Tìm hiểu ngay</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CommunityPage;




