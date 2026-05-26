import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChatBubbleLeftRightIcon,
    GlobeAltIcon,
    HandThumbUpIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    PhotoIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import caremateApi from '../api/caremateApi';
import type { CommunityCommentDto, CommunityCommentLikerDto, CommunityPostDto } from '../api/frontend-api-contract';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/apiError';

const getRelativeTime = (value: string) => {
    const timestamp = new Date(value).getTime();
    const diffMs = Date.now() - timestamp;
    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
};

const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || 'U';

const parseTags = (value: string) =>
    value
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean)
        .slice(0, 5);

const countComments = (comments: CommunityCommentDto[]): number =>
    comments.reduce((total, comment) => total + 1 + countComments(comment.replies ?? []), 0);

const appendReply = (
    comments: CommunityCommentDto[],
    parentCommentId: number,
    reply: CommunityCommentDto
): CommunityCommentDto[] =>
    comments.map((comment) => {
        if (comment.id === parentCommentId) {
            return { ...comment, replies: [...(comment.replies ?? []), reply] };
        }

        return {
            ...comment,
            replies: appendReply(comment.replies ?? [], parentCommentId, reply),
        };
    });

const replaceComment = (
    comments: CommunityCommentDto[],
    updatedComment: CommunityCommentDto
): CommunityCommentDto[] =>
    comments.map((comment) => {
        if (comment.id === updatedComment.id) {
            return { ...updatedComment, replies: comment.replies ?? updatedComment.replies ?? [] };
        }

        return {
            ...comment,
            replies: replaceComment(comment.replies ?? [], updatedComment),
        };
    });

const flattenReplies = (comments: CommunityCommentDto[]): CommunityCommentDto[] =>
    comments.flatMap((comment) => [comment, ...flattenReplies(comment.replies ?? [])]);

const CommunityPage = () => {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [posts, setPosts] = useState<CommunityPostDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftContent, setDraftContent] = useState('');
    const [draftTags, setDraftTags] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
    const [likersDialog, setLikersDialog] = useState<{
        title: string;
        users: CommunityCommentLikerDto[];
        loading: boolean;
    } | null>(null);

    const currentUserName = user?.username || 'Thành viên CareMate';

    useEffect(() => {
        const loadCommunityPosts = async () => {
            try {
                setLoading(true);
                const data = await caremateApi.getCommunityPosts();
                setPosts(data);
            } catch {
                showToast('Không thể tải bài viết cộng đồng.', 'error');
            } finally {
                setLoading(false);
            }
        };

        void loadCommunityPosts();
    }, [showToast]);

    useEffect(() => {
        if (!selectedImage) {
            setImagePreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedImage);
        setImagePreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedImage]);

    const filteredPosts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return posts;
        return posts.filter((post) => {
            const haystack = `${post.title} ${post.content} ${post.author} ${post.tags.join(' ')}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [posts, searchQuery]);

    const handleCreatePost = async () => {
        if (isSubmittingPost) return;

        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để tạo bài viết.', 'error');
            return;
        }

        const title = draftTitle.trim();
        const content = draftContent.trim();
        if (!content && !selectedImage) return;

        try {
            setIsSubmittingPost(true);
            const newPost = await caremateApi.createCommunityPost({
                title,
                content,
                tags: parseTags(draftTags),
                image: selectedImage,
            });
            setPosts((prev) => [newPost, ...prev]);
            setDraftTitle('');
            setDraftContent('');
            setDraftTags('');
            setSelectedImage(null);
            setIsComposerOpen(false);
            setExpandedPostId(newPost.id);
        } catch (error) {
            showToast(getErrorMessage(error, 'Đăng bài viết không thành công.'), 'error');
        } finally {
            setIsSubmittingPost(false);
        }
    };

    const handleToggleLike = async (postId: number) => {
        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để thích bài viết.', 'error');
            return;
        }

        try {
            const updatedPost = await caremateApi.toggleCommunityPostLike(postId);
            setPosts((prev) => prev.map((post) => post.id === postId ? updatedPost : post));
        } catch {
            showToast('Không thể cập nhật lượt thích.', 'error');
        }
    };

    const handleCreateComment = async (postId: number, parentCommentId?: number) => {
        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để bình luận.', 'error');
            return;
        }

        const content = parentCommentId
            ? replyDrafts[parentCommentId]?.trim()
            : commentDrafts[postId]?.trim();
        if (!content) return;

        try {
            const comment = await caremateApi.createCommunityComment(postId, {
                content,
                parentCommentId: parentCommentId ?? null,
            });
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            comments: parentCommentId
                                ? appendReply(post.comments, parentCommentId, comment)
                                : [...post.comments, comment],
                        }
                        : post
                )
            );
            if (parentCommentId) {
                setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: '' }));
                setReplyingToCommentId(null);
            } else {
                setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
            }
            setExpandedPostId(postId);
        } catch {
            showToast('Không thể gửi bình luận.', 'error');
        }
    };

    const handleToggleCommentLike = async (postId: number, commentId: number) => {
        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để thích bình luận.', 'error');
            return;
        }

        try {
            const updatedComment = await caremateApi.toggleCommunityCommentLike(postId, commentId);
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? { ...post, comments: replaceComment(post.comments, updatedComment) }
                        : post
                )
            );
        } catch {
            showToast('Không thể cập nhật lượt thích bình luận.', 'error');
        }
    };

    const handleOpenCommentLikers = async (postId: number, comment: CommunityCommentDto) => {
        if (comment.likes <= 0) return;

        setLikersDialog({ title: `Người đã thích bình luận của ${comment.author}`, users: [], loading: true });
        try {
            const users = await caremateApi.getCommunityCommentLikers(postId, comment.id);
            setLikersDialog({ title: `Người đã thích bình luận của ${comment.author}`, users, loading: false });
        } catch {
            setLikersDialog(null);
            showToast('Không thể tải danh sách người thích.', 'error');
        }
    };

    const renderComment = (postId: number, comment: CommunityCommentDto, depth = 0, renderReplies = true) => {
        const replies = comment.replies ?? [];
        const isReply = depth > 0;

        return (
            <div key={comment.id} className={isReply ? 'relative pl-12' : ''}>
                <div className="relative flex items-start gap-3">
                    {isReply && <span className="absolute left-0 top-5 h-px w-9 bg-slate-200" />}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-500">
                        {comment.avatar ? <img src={comment.avatar} alt={comment.author} className="h-full w-full rounded-full object-cover" /> : getInitial(comment.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="relative inline-block max-w-[calc(100%-1.25rem)] rounded-[18px] bg-slate-200/80 px-4 py-2 text-left">
                            <div className="truncate pr-4 text-sm font-black leading-5 text-slate-950">{comment.author}</div>
                            <p className="whitespace-pre-line pr-2 text-[15px] font-medium leading-6 text-slate-800">{comment.content}</p>
                            {comment.likes > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleOpenCommentLikers(postId, comment)}
                                    className="absolute -bottom-2 -right-3 flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-xs font-black leading-none text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.16)] ring-1 ring-slate-100 transition hover:bg-slate-50 hover:text-brand"
                                    aria-label="Xem người đã thích bình luận"
                                >
                                    {comment.likes}
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                                        <HandThumbUpSolidIcon className="h-3 w-3" />
                                    </span>
                                </button>
                            )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 pl-4 text-xs font-black text-slate-500">
                            <span>{getRelativeTime(comment.createdAt)}</span>
                            <button
                                type="button"
                                onClick={() => handleToggleCommentLike(postId, comment.id)}
                                className={`transition hover:text-brand ${comment.likedByMe ? 'text-brand' : ''}`}
                            >
                                Thích
                            </button>
                            <button
                                type="button"
                                onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                                className="transition hover:text-brand"
                            >
                                Trả lời
                            </button>
                        </div>
                    </div>
                </div>

                {replyingToCommentId === comment.id && (
                    <div className="relative mt-3 flex items-center gap-3 pl-12">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-500">
                            {getInitial(currentUserName)}
                        </div>
                        <input
                            value={replyDrafts[comment.id] ?? ''}
                            onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') handleCreateComment(postId, comment.id);
                            }}
                            placeholder={`Trả lời ${comment.author}...`}
                            className="min-w-0 flex-1 rounded-full border-none bg-slate-200/80 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:bg-white focus:ring-4 focus:ring-brand/10"
                        />
                        <button
                            type="button"
                            onClick={() => handleCreateComment(postId, comment.id)}
                            disabled={!replyDrafts[comment.id]?.trim()}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Gửi phản hồi"
                        >
                            <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {renderReplies && replies.length > 0 && (
                    <div className="relative mt-3 space-y-3 before:absolute before:left-[18px] before:top-0 before:h-full before:w-px before:bg-slate-200">
                        {flattenReplies(replies).map((reply) => renderComment(postId, reply, 1, false))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-20">
            <section className="border-b border-slate-100 bg-white py-14">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="accent-label">Cộng đồng CareMate</div>
                            <h1 className="mt-4 text-4xl font-black text-slate-900">Chia sẻ và kết nối</h1>
                            <p className="mt-2 max-w-2xl text-sm font-bold leading-7 text-slate-500">
                                Nơi các gia đình đặt câu hỏi, chia sẻ kinh nghiệm chăm sóc mẹ và bé, và cùng nhau tìm câu trả lời thực tế.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto mt-10 grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
                <main className="space-y-6">
                    <div className="rounded-[24px] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xl font-black text-slate-500 ring-1 ring-slate-200">
                                {getInitial(currentUserName)}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsComposerOpen(true)}
                                className="flex min-h-14 flex-1 items-center rounded-full bg-slate-100 px-6 text-left text-[18px] font-semibold text-slate-500 transition hover:bg-slate-200"
                            >
                                {currentUserName}, bạn đang nghĩ gì thế?
                            </button>
                            <label className="hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full text-green-500 transition hover:bg-green-50 md:flex" aria-label="Thêm ảnh">
                                <PhotoIcon className="h-7 w-7" />
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        setSelectedImage(file);
                                        setIsComposerOpen(true);
                                        event.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {isComposerOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-[2px]">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="flex max-h-[calc(100vh-48px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.25)]"
                            >
                                <div className="relative border-b border-slate-200 px-6 py-5 text-center">
                                    <h2 className="text-[28px] font-black leading-none text-slate-950">Tạo bài viết</h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsComposerOpen(false)}
                                        className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                        aria-label="Đóng"
                                    >
                                        <XMarkIcon className="h-8 w-8" />
                                    </button>
                                </div>

                                <div className="min-h-0 overflow-y-auto px-6 py-5">
                                    <div className="mb-5 flex items-center gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xl font-black text-slate-500 ring-1 ring-slate-200">
                                            {getInitial(currentUserName)}
                                        </div>
                                        <div>
                                            <div className="text-[22px] font-black leading-tight text-slate-950">{currentUserName}</div>
                                            <button
                                                type="button"
                                                className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-200 px-2.5 py-1.5 text-[13px] font-black text-slate-900"
                                            >
                                                <GlobeAltIcon className="h-4 w-4" />
                                                Công khai
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        value={draftContent}
                                        onChange={(event) => setDraftContent(event.target.value)}
                                        placeholder={`${currentUserName}, bạn đang nghĩ gì thế?`}
                                        className="min-h-[170px] w-full resize-none border-none bg-transparent px-0 py-2 text-[32px] font-normal leading-tight text-slate-800 outline-none placeholder:text-slate-500 focus:ring-0"
                                    />

                                    {imagePreviewUrl && (
                                        <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                            <img src={imagePreviewUrl} alt="Ảnh xem trước" className="max-h-[360px] w-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => setSelectedImage(null)}
                                                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white transition hover:bg-slate-900"
                                                aria-label="Xóa ảnh"
                                            >
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-slate-300 px-5 py-4 shadow-sm">
                                        <span className="text-[20px] font-black text-slate-950">Thêm vào bài viết của bạn</span>
                                        <div className="flex items-center gap-3">
                                            <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-green-500 transition hover:bg-green-50" aria-label="Chọn ảnh">
                                                <PhotoIcon className="h-8 w-8" />
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg"
                                                    className="hidden"
                                                    onChange={(event) => {
                                                        setSelectedImage(event.target.files?.[0] ?? null);
                                                        event.target.value = '';
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6">
                                    <button
                                        type="button"
                                        onClick={handleCreatePost}
                                        disabled={isSubmittingPost || (!draftContent.trim() && !selectedImage)}
                                        className="w-full rounded-xl bg-brand px-6 py-4 text-[18px] font-black text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                    >
                                        {isSubmittingPost ? 'Đang đăng...' : 'Đăng'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <div className="flex gap-4 rounded-[24px] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Tìm kiếm bài viết, chủ đề..."
                                className="w-full rounded-2xl border-none bg-slate-50 py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>

                    {filteredPosts.map((post, idx) => {
                        const liked = post.likedByMe;
                        const commentsOpen = expandedPostId === post.id;

                        return (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="rounded-[24px] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:shadow-[0_24px_55px_rgba(15,23,42,0.08)]"
                            >
                                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-xl font-black text-brand">
                                            {post.avatar ? <img src={post.avatar} alt={post.author} className="h-full w-full rounded-2xl object-cover" /> : getInitial(post.author)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{post.author}</div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                {post.role} • {getRelativeTime(post.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => setSearchQuery(tag)}
                                                    className="rounded-xl bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-tight text-slate-400 transition hover:bg-brand/10 hover:text-brand"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <h2 className="mb-3 text-xl font-black leading-tight text-slate-900">{post.title}</h2>
                                <p className="mb-7 whitespace-pre-line text-sm font-medium leading-7 text-slate-600">{post.content}</p>
                                {post.imageUrl && (
                                    <div className="mb-7 overflow-hidden rounded-2xl bg-slate-50">
                                        <img src={post.imageUrl} alt={post.title} className="max-h-[560px] w-full object-contain" />
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                                    <div className="flex gap-5">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleLike(post.id)}
                                            className={`flex items-center gap-2 transition ${liked ? 'text-brand' : 'text-slate-400 hover:text-brand'}`}
                                        >
                                            {liked ? <HandThumbUpSolidIcon className="h-5 w-5" /> : <HandThumbUpIcon className="h-5 w-5" />}
                                            <span className="text-xs font-black">{post.likes}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedPostId(commentsOpen ? null : post.id)}
                                            className={`flex items-center gap-2 transition ${commentsOpen ? 'text-brand' : 'text-slate-400 hover:text-brand'}`}
                                        >
                                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                            <span className="text-xs font-black">{countComments(post.comments)}</span>
                                        </button>
                                    </div>
                                </div>

                                {commentsOpen && (
                                    <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 px-4 py-5">
                                        {post.comments.map((comment) => renderComment(post.id, comment))}

                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-black text-brand">
                                                {getInitial(currentUserName)}
                                            </div>
                                            <input
                                                value={commentDrafts[post.id] ?? ''}
                                                onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') handleCreateComment(post.id);
                                                }}
                                                placeholder="Viết bình luận..."
                                                className="min-w-0 flex-1 rounded-full border-none bg-slate-200/80 px-5 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:bg-white focus:ring-4 focus:ring-brand/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleCreateComment(post.id)}
                                                disabled={!commentDrafts[post.id]?.trim()}
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Gửi bình luận"
                                            >
                                                <PaperAirplaneIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.article>
                        );
                    })}

                    {loading && (
                        <div className="rounded-[24px] bg-white px-6 py-14 text-center shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                            <h2 className="text-lg font-black text-slate-900">Đang tải cộng đồng...</h2>
                        </div>
                    )}

                    {!loading && filteredPosts.length === 0 && (
                        <div className="rounded-[24px] bg-white px-6 py-14 text-center shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                            <h2 className="text-lg font-black text-slate-900">Không tìm thấy bài viết</h2>
                            <p className="mt-2 text-sm font-bold text-slate-400">Thử tìm bằng từ khóa khác hoặc tạo bài viết mới.</p>
                        </div>
                    )}
                </main>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-[24px] bg-slate-900 p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                        <h3 className="text-lg font-black">Quy tắc cộng đồng</h3>
                        <div className="mt-4 space-y-3 text-sm font-medium leading-6 text-white/70">
                            <p>Chia sẻ trải nghiệm thật, tôn trọng khác biệt và tránh đưa lời khuyên y khoa thay cho bác sĩ.</p>
                            <p>Khi cần hỗ trợ khẩn cấp, hãy liên hệ cơ sở y tế gần nhất.</p>
                        </div>
                    </div>
                </aside>
            </div>

            {likersDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h3 className="text-base font-black text-slate-900">Người đã thích</h3>
                            <button
                                type="button"
                                onClick={() => setLikersDialog(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Đóng danh sách người thích"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[360px] overflow-y-auto p-3">
                            {likersDialog.loading ? (
                                <div className="px-3 py-8 text-center text-sm font-bold text-slate-400">Đang tải...</div>
                            ) : (
                                <div className="space-y-1">
                                    {likersDialog.users.map((liker) => (
                                        <div key={liker.userId} className="flex items-center gap-3 rounded-xl px-3 py-2">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-black text-brand">
                                                {liker.avatar ? <img src={liker.avatar} alt={liker.fullName} className="h-full w-full rounded-full object-cover" /> : getInitial(liker.fullName)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-black text-slate-900">{liker.fullName}</div>
                                            </div>
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                                                <HandThumbUpSolidIcon className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                    ))}
                                    {likersDialog.users.length === 0 && (
                                        <div className="px-3 py-8 text-center text-sm font-bold text-slate-400">Chưa có lượt thích.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
