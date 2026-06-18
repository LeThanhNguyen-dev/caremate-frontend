import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChatBubbleLeftRightIcon,
    EllipsisHorizontalIcon,
    GlobeAltIcon,
    HandThumbUpIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    PencilSquareIcon,
    PhotoIcon,
    TrashIcon,
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

const isGeneratedTitle = (title: string, content: string) => {
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    if (!normalizedTitle || !normalizedContent) return false;

    const generatedTitle = normalizedContent.length > 80 ? `${normalizedContent.slice(0, 77)}...` : normalizedContent;
    return normalizedTitle === generatedTitle;
};

const getVisiblePostTitle = (post: CommunityPostDto) =>
    isGeneratedTitle(post.title, post.content) ? '' : post.title.trim();

const getCommunityRoleLabel = (role: string) => {
    const normalized = role.trim().toLowerCase();
    if (normalized === 'admin' || normalized.includes('quản trị') || normalized.includes('quan tri')) {
        return 'Quản trị viên';
    }
    if (normalized === 'nurse_confirmed' || normalized.includes('chuyên gia') || normalized.includes('chuyen gia')) {
        return 'Chuyên gia CareMate';
    }
    return 'Thành viên CareMate';
};

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
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
    const [openPostMenuId, setOpenPostMenuId] = useState<number | null>(null);
    const [editingPost, setEditingPost] = useState<CommunityPostDto | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editTags, setEditTags] = useState('');
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
    const [likersDialog, setLikersDialog] = useState<{
        title: string;
        users: CommunityCommentLikerDto[];
        loading: boolean;
    } | null>(null);

    const currentUserName = user?.username || 'Thành viên CareMate';
    const currentUserId = user?.userId ?? null;
    const currentUserIsAdmin = user?.role === 'admin';

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

    const handleDeletePost = async (postId: number) => {
        if (deletingPostId) return;

        if (!isAuthenticated) {
            showToast('Vui lòng đăng nhập để xóa bài viết.', 'error');
            return;
        }

        const confirmed = window.confirm('Xóa bài viết này? Hành động này không thể hoàn tác.');
        if (!confirmed) return;

        try {
            setDeletingPostId(postId);
            await caremateApi.deleteCommunityPost(postId);
            setPosts((prev) => prev.filter((post) => post.id !== postId));
            setExpandedPostId((prev) => (prev === postId ? null : prev));
            showToast('Đã xóa bài viết.', 'success');
        } catch {
            showToast('Không thể xóa bài viết.', 'error');
        } finally {
            setDeletingPostId(null);
        }
    };

    const openEditPost = (post: CommunityPostDto) => {
        setEditingPost(post);
        setEditTitle(getVisiblePostTitle(post));
        setEditContent(post.content);
        setEditTags(post.tags.join(', '));
        setOpenPostMenuId(null);
    };

    const closeEditPost = () => {
        if (isSubmittingEdit) return;
        setEditingPost(null);
        setEditTitle('');
        setEditContent('');
        setEditTags('');
    };

    const handleUpdatePost = async () => {
        if (!editingPost || isSubmittingEdit) return;

        const title = editTitle.trim();
        const content = editContent.trim();
        if (!content && !editingPost.imageUrl) {
            showToast('Vui lòng nhập nội dung bài viết.', 'error');
            return;
        }

        try {
            setIsSubmittingEdit(true);
            const updatedPost = await caremateApi.updateCommunityPost(editingPost.id, {
                title,
                content,
                tags: parseTags(editTags),
            });
            setPosts((prev) => prev.map((post) => post.id === updatedPost.id ? updatedPost : post));
            closeEditPost();
            showToast('Đã cập nhật bài viết.', 'success');
        } catch (error) {
            showToast(getErrorMessage(error, 'Không thể cập nhật bài viết.'), 'error');
        } finally {
            setIsSubmittingEdit(false);
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

        const title = `Người đã thích bình luận của ${comment.author}`;
        setLikersDialog({ title, users: [], loading: true });
        try {
            const users = await caremateApi.getCommunityCommentLikers(postId, comment.id);
            setLikersDialog({ title, users, loading: false });
        } catch {
            setLikersDialog(null);
            showToast('Không thể tải danh sách người thích.', 'error');
        }
    };

    const renderComment = (postId: number, comment: CommunityCommentDto, depth = 0, renderReplies = true) => {
        const replies = comment.replies ?? [];
        const isReply = depth > 0;

        return (
            <div key={comment.id} className={isReply ? 'relative pl-10 sm:pl-12' : ''}>
                <div className="relative flex items-start gap-3">
                    {isReply && <span className="absolute left-0 top-5 h-px w-8 bg-slate-200 sm:w-9" />}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-xs font-black text-brand ring-1 ring-brand/10">
                        {comment.avatar ? <img src={comment.avatar} alt={comment.author} className="h-full w-full object-cover" /> : getInitial(comment.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="relative inline-block max-w-[calc(100%-1.25rem)] rounded-2xl bg-slate-50 px-4 py-2.5 text-left ring-1 ring-slate-100">
                            <div className="truncate pr-4 text-sm font-black leading-5 text-[#10233F]">{comment.author}</div>
                            <p className="whitespace-pre-line pr-2 text-[14px] font-medium leading-6 text-slate-600">{comment.content}</p>
                            {comment.likes > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleOpenCommentLikers(postId, comment)}
                                    className="absolute -bottom-2 -right-3 flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-xs font-black leading-none text-slate-500 shadow-[0_8px_18px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 transition hover:text-brand"
                                    aria-label="Xem người đã thích bình luận"
                                >
                                    {comment.likes}
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                                        <HandThumbUpSolidIcon className="h-3 w-3" />
                                    </span>
                                </button>
                            )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 pl-4 text-xs font-black text-slate-400">
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
                    <div className="relative mt-3 flex items-center gap-3 pl-10 sm:pl-12">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-xs font-black text-brand">
                            {getInitial(currentUserName)}
                        </div>
                        <input
                            value={replyDrafts[comment.id] ?? ''}
                            onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') handleCreateComment(postId, comment.id);
                            }}
                            placeholder={`Trả lời ${comment.author}...`}
                            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                        />
                        <button
                            type="button"
                            onClick={() => handleCreateComment(postId, comment.id)}
                            disabled={!replyDrafts[comment.id]?.trim()}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#10233F] text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40"
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
        <div className="min-h-screen bg-[linear-gradient(120deg,#effff8_0%,#fff_45%,#fff1f8_100%)]">
            <section className="relative overflow-hidden border-b border-brand/10 bg-[linear-gradient(120deg,#effff8_0%,#fff_45%,#fff1f8_100%)] px-5 pb-14 pt-12 shadow-[inset_0_-1px_0_rgba(236,72,153,0.08)] sm:px-8 lg:px-10">
                <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-200/45 blur-[120px] -ml-44 -mt-44"></div>
                <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-brand/18 blur-[130px] -mb-56 -mr-52"></div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/70 to-transparent"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="relative z-10 mx-auto max-w-7xl"
                >
                    <div className="max-w-3xl">
                        <div className="mb-5 w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-brand shadow-sm">
                            Cộng đồng CareMate
                        </div>
                        <h1 className="text-[54px] font-black leading-[1.04] tracking-tight text-[#0B1F3A] sm:text-[70px] lg:text-[88px]">
                            Chia sẻ
                            <span className="mt-2 block font-semibold italic text-brand sm:mt-3">kinh nghiệm.</span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-[18px] font-black leading-8 text-[#0B1F3A]">
                            Đặt câu hỏi, lưu lại trải nghiệm thực tế và tìm những gợi ý gần gũi từ các gia đình đang đồng hành cùng CareMate.
                        </p>
                        <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-[1.8] text-slate-500">
                            Cùng trao đổi về chăm sóc mẹ và bé, lịch sinh hoạt, phục hồi sau sinh và những tình huống thường gặp tại nhà.
                        </p>
                        <div className="mt-9 flex flex-wrap gap-4">
                            <button
                                type="button"
                                onClick={() => setIsComposerOpen(true)}
                                className="rounded-full bg-[#0B1F3A] px-9 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#0B1F3A]/15 transition hover:-translate-y-0.5 hover:bg-brand hover:shadow-brand/20"
                            >
                                Tạo bài viết
                            </button>
                            <a href="#community-feed" className="rounded-full border border-slate-200 bg-white px-9 py-4 text-xs font-black uppercase tracking-widest text-[#0B1F3A] shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-lg hover:shadow-slate-200/70">
                                Xem thảo luận
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>

            <div id="community-feed" className="mx-auto w-full max-w-7xl scroll-mt-28 space-y-6 px-5 pb-14 pt-8 sm:px-8 lg:px-10">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <main className="space-y-6">
                        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/35 sm:p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#10233F] text-xl font-black text-white">
                                    {getInitial(currentUserName)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsComposerOpen(true)}
                                    className="flex min-h-14 flex-1 items-center rounded-2xl border border-slate-200 bg-white px-5 text-left text-sm font-bold text-slate-400 shadow-sm transition hover:border-brand/30 hover:text-[#10233F] hover:shadow-lg hover:shadow-brand/10"
                                >
                                    {currentUserName}, bạn muốn chia sẻ điều gì?
                                </button>
                                <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-brand/10 text-brand transition hover:bg-brand hover:text-white" aria-label="Thêm ảnh">
                                    <PhotoIcon className="h-6 w-6" />
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
                        </section>

                        {isComposerOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="flex max-h-[calc(100vh-48px)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_rgba(15,23,42,0.25)]"
                                >
                                    <div className="relative border-b border-slate-100 px-6 py-5 text-center">
                                        <h2 className="text-2xl font-black leading-none text-[#10233F]">Tạo bài viết</h2>
                                        <button
                                            type="button"
                                            onClick={() => setIsComposerOpen(false)}
                                            className="absolute right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-[#10233F]"
                                            aria-label="Đóng"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="min-h-0 overflow-y-auto px-6 py-5">
                                        <div className="mb-5 flex items-center gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#10233F] text-xl font-black text-white">
                                                {getInitial(currentUserName)}
                                            </div>
                                            <div>
                                                <div className="text-xl font-black leading-tight text-[#10233F]">{currentUserName}</div>
                                                <button
                                                    type="button"
                                                    className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-black text-brand"
                                                >
                                                    <GlobeAltIcon className="h-4 w-4" />
                                                    Công khai
                                                </button>
                                            </div>
                                        </div>

                                        <input
                                            value={draftTitle}
                                            onChange={(event) => setDraftTitle(event.target.value)}
                                            placeholder="Tiêu đề bài viết"
                                            className="mb-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                        />

                                        <textarea
                                            value={draftContent}
                                            onChange={(event) => setDraftContent(event.target.value)}
                                            placeholder={`${currentUserName}, bạn đang nghĩ gì thế?`}
                                            className="min-h-[170px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold leading-7 text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                        />

                                        <input
                                            value={draftTags}
                                            onChange={(event) => setDraftTags(event.target.value)}
                                            placeholder="Chủ đề, phân tách bằng dấu phẩy"
                                            className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                        />

                                        {imagePreviewUrl && (
                                            <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                                <img src={imagePreviewUrl} alt="Ảnh xem trước" className="max-h-[360px] w-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedImage(null)}
                                                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/80 text-white transition hover:bg-slate-900"
                                                    aria-label="Xóa ảnh"
                                                >
                                                    <XMarkIcon className="h-6 w-6" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-5 py-4">
                                            <span className="text-sm font-black text-[#10233F]">Thêm vào bài viết</span>
                                            <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-brand/10 text-brand transition hover:bg-brand hover:text-white" aria-label="Chọn ảnh">
                                                <PhotoIcon className="h-6 w-6" />
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

                                    <div className="px-6 pb-6">
                                        <button
                                            type="button"
                                            onClick={handleCreatePost}
                                            disabled={isSubmittingPost || (!draftContent.trim() && !selectedImage)}
                                            className="w-full rounded-2xl bg-[#10233F] px-6 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                        >
                                            {isSubmittingPost ? 'Đang đăng...' : 'Đăng bài'}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/35 sm:p-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Tìm kiếm bài viết, chủ đề..."
                                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-5 text-sm font-bold text-[#10233F] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                />
                            </div>
                        </section>

                        {filteredPosts.map((post, idx) => {
                            const liked = post.likedByMe;
                            const commentsOpen = expandedPostId === post.id;
                            const canManagePost = currentUserIsAdmin || currentUserId === post.authorId;
                            const visibleTitle = getVisiblePostTitle(post);

                            return (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/35 transition duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-2xl hover:shadow-slate-200/75"
                                >
                                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#10233F] text-lg font-black text-white shadow-lg shadow-[#10233F]/10">
                                                {post.avatar ? <img src={post.avatar} alt={post.author} className="h-full w-full object-cover" /> : getInitial(post.author)}
                                            </div>
                                            <div>
                                                <div className="text-[16px] font-black leading-tight text-[#10233F]">{post.author}</div>
                                                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                                    {getCommunityRoleLabel(post.role)} · {getRelativeTime(post.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                                            {post.tags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => setSearchQuery(tag)}
                                                    className="rounded-full bg-brand/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-brand transition hover:bg-brand hover:text-white"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                            {canManagePost && (
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenPostMenuId(openPostMenuId === post.id ? null : post.id)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-brand/10 hover:text-brand"
                                                        aria-label="Mở tuỳ chọn bài viết"
                                                        title="Tuỳ chọn bài viết"
                                                    >
                                                        <EllipsisHorizontalIcon className="h-5 w-5" />
                                                    </button>
                                                    {openPostMenuId === post.id && (
                                                        <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 text-sm font-bold text-slate-600 shadow-xl shadow-slate-200/60">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditPost(post)}
                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50 hover:text-[#10233F]"
                                                            >
                                                                <PencilSquareIcon className="h-4 w-4" />
                                                                Chỉnh sửa
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setOpenPostMenuId(null);
                                                                    void handleDeletePost(post.id);
                                                                }}
                                                                disabled={deletingPostId === post.id}
                                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                                Xóa bài viết
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {visibleTitle && <h2 className="mb-4 max-w-3xl break-words text-2xl font-black leading-snug text-[#10233F]">{visibleTitle}</h2>}
                                    <p className="mb-7 max-w-3xl whitespace-pre-line break-words text-[15px] font-normal leading-8 text-slate-600">{post.content}</p>
                                    {post.imageUrl && (
                                        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                                            <img src={post.imageUrl} alt={visibleTitle || 'Ảnh bài viết cộng đồng'} className="max-h-[560px] w-full object-contain" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleLike(post.id)}
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black transition ${liked ? 'bg-brand/10 text-brand' : 'bg-slate-50 text-slate-500 hover:bg-brand/10 hover:text-brand'}`}
                                            >
                                                {liked ? <HandThumbUpSolidIcon className="h-5 w-5" /> : <HandThumbUpIcon className="h-5 w-5" />}
                                                {post.likes}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedPostId(commentsOpen ? null : post.id)}
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black transition ${commentsOpen ? 'bg-brand/10 text-brand' : 'bg-slate-50 text-slate-500 hover:bg-brand/10 hover:text-brand'}`}
                                            >
                                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                {countComments(post.comments)}
                                            </button>
                                        </div>
                                    </div>

                                    {commentsOpen && (
                                        <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 px-4 py-5 ring-1 ring-slate-100">
                                            {post.comments.map((comment) => renderComment(post.id, comment))}

                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-sm font-black text-brand">
                                                    {getInitial(currentUserName)}
                                                </div>
                                                <input
                                                    value={commentDrafts[post.id] ?? ''}
                                                    onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') handleCreateComment(post.id);
                                                    }}
                                                    placeholder="Viết bình luận..."
                                                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleCreateComment(post.id)}
                                                    disabled={!commentDrafts[post.id]?.trim()}
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#10233F] text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40"
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
                            <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-lg shadow-slate-200/35">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-brand border-t-transparent"></div>
                                <h2 className="mt-5 text-sm font-black uppercase tracking-[0.2em] text-slate-400">Đang tải cộng đồng...</h2>
                            </div>
                        )}

                        {!loading && filteredPosts.length === 0 && (
                            <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-lg shadow-slate-200/35">
                                <h2 className="text-lg font-black text-[#10233F]">Không tìm thấy bài viết</h2>
                                <p className="mt-2 text-sm font-semibold text-slate-400">Thử tìm bằng từ khóa khác hoặc tạo bài viết mới.</p>
                            </div>
                        )}
                    </main>

                    <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/35">
                            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Quy tắc cộng đồng</div>
                            <h3 className="mt-3 text-2xl font-black leading-tight text-[#10233F]">Tôn trọng và chia sẻ có trách nhiệm.</h3>
                            <div className="mt-5 space-y-3 text-sm font-semibold leading-7 text-slate-500">
                                <p>Chia sẻ trải nghiệm thật, tôn trọng khác biệt và tránh đưa lời khuyên y khoa thay cho bác sĩ.</p>
                                <p>Khi cần hỗ trợ khẩn cấp, hãy liên hệ cơ sở y tế gần nhất.</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-[#0B2341] p-6 text-white shadow-xl shadow-slate-300/40">
                            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Gợi ý đăng bài</div>
                            <div className="mt-4 space-y-3 text-sm font-semibold leading-7 text-white/75">
                                <p>Đặt tiêu đề rõ ý, thêm chủ đề bằng dấu phẩy và mô tả bối cảnh để mọi người dễ hỗ trợ hơn.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {editingPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-black text-[#10233F]">Chỉnh sửa bài viết</h3>
                            <button
                                type="button"
                                onClick={closeEditPost}
                                className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-[#10233F]"
                                aria-label="Đóng chỉnh sửa bài viết"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-5">
                            <input
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                placeholder="Tiêu đề bài viết"
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                            />
                            <textarea
                                value={editContent}
                                onChange={(event) => setEditContent(event.target.value)}
                                placeholder="Nội dung bài viết"
                                rows={7}
                                className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                            />
                            <input
                                value={editTags}
                                onChange={(event) => setEditTags(event.target.value)}
                                placeholder="Chủ đề, phân tách bằng dấu phẩy"
                                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#10233F] outline-none placeholder:text-slate-400 focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                            />
                            {editingPost.imageUrl && (
                                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                                    <img src={editingPost.imageUrl} alt={getVisiblePostTitle(editingPost) || 'Ảnh bài viết cộng đồng'} className="max-h-[320px] w-full object-contain" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={closeEditPost}
                                disabled={isSubmittingEdit}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:border-slate-300 hover:text-[#10233F] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdatePost}
                                disabled={isSubmittingEdit || (!editContent.trim() && !editingPost.imageUrl)}
                                className="rounded-2xl bg-[#10233F] px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                                {isSubmittingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {likersDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h3 className="text-base font-black text-[#10233F]">Người đã thích</h3>
                            <button
                                type="button"
                                onClick={() => setLikersDialog(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-[#10233F]"
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
                                        <div key={liker.userId} className="flex items-center gap-3 rounded-2xl px-3 py-2">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-sm font-black text-brand">
                                                {liker.avatar ? <img src={liker.avatar} alt={liker.fullName} className="h-full w-full object-cover" /> : getInitial(liker.fullName)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-black text-[#10233F]">{liker.fullName}</div>
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
