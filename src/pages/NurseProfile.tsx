import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    IdentificationIcon,
    DocumentTextIcon,
    PlusIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';
import { nurseApi } from '../api/nurseApi';
import type { DocumentDto, NurseProfileDetailDto } from '../types/nurse';
import { getErrorMessage } from '../utils/apiError';

const NurseProfile = () => {
    const { showToast } = useToast();
    const [profile, setProfile] = useState<NurseProfileDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({ bio: '', yearsExperience: 0, serviceRadiusKm: 10 });
    const [docType, setDocType] = useState('id_card_front');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await nurseApi.getProfile();
            setProfile(data);
            setFormData({
                bio: data.bio || '',
                yearsExperience: data.yearsExperience || 0,
                serviceRadiusKm: data.serviceRadiusKm || 10,
            });
        } catch {
            showToast('Không thể tải hồ sơ điều dưỡng.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    const updateProfile = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSaving(true);
            await nurseApi.updateProfile(formData);
            showToast('Cập nhật hồ sơ thành công.', 'success');
            await loadProfile();
        } catch {
            showToast('Cập nhật hồ sơ thất bại.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const uploadDocument = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedFiles.length) {
            showToast('Vui lòng chọn ít nhất một tài liệu.', 'error');
            return;
        }

        try {
            setUploading(true);
            await nurseApi.uploadDocuments({ type: docType, files: selectedFiles });
            setSelectedFiles([]);
            showToast(`Đã gửi ${selectedFiles.length} tài liệu lên hệ thống.`, 'success');
            await loadProfile();
        } catch (err) {
            console.error('Upload error:', err);
            showToast(getErrorMessage(err, 'Không thể tải tài liệu lên hệ thống.'), 'error');
        } finally {
            setUploading(false);
        }
    };

    const submitVerification = async () => {
        try {
            await nurseApi.submitVerification();
            showToast('Hồ sơ đã được gửi duyệt thành công.', 'success');
            await loadProfile();
        } catch (err) {
            showToast(getErrorMessage(err, 'Không thể gửi duyệt hồ sơ.'), 'error');
        }
    };

    const profileStatus =
        profile?.isVerified === 'verified'
            ? 'Đã xác minh'
            : profile?.isVerified === 'rejected'
              ? 'Bị từ chối'
              : 'Đang chờ duyệt';
    const hasFront = !!profile?.documents?.some((d) => d.type === 'id_card_front');
    const hasBack = !!profile?.documents?.some((d) => d.type === 'id_card_back');
    const hasCertificate = !!profile?.documents?.some((d) => d.type === 'certificate');
    const canSubmit = hasFront && hasBack && hasCertificate;

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#10B981] border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Đang truy xuất hồ sơ y tế...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 selection:bg-emerald-100">
            <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
                <div className="luxury-card bg-slate-900 text-white p-12 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Hồ sơ chuyên môn</div>
                        <h1 className="text-4xl font-black text-white mt-4 tracking-tight">{profile?.fullName}</h1>
                        <p className="mt-4 max-w-2xl text-lg font-medium text-white/50 leading-relaxed">
                            Quản lý thông tin nghề nghiệp và tài liệu chuyên môn để duy trì trạng thái xác minh trên CareMate.
                        </p>
                        <div className="mt-10 flex items-center gap-3">
                            <span className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${profile?.isVerified === 'verified' ? 'bg-emerald-500/20 text-[#10B981]' : 'bg-amber-500/20 text-amber-400'}`}>
                                <ShieldCheckIcon className="h-4 w-4" />
                                {profileStatus}
                            </span>
                        </div>
                        {profile?.isVerified === 'rejected' && profile.rejectionReason && (
                            <div className="mt-4 rounded-xl border border-red-300 bg-red-500/10 p-4 text-sm text-red-100">
                                <div className="font-black uppercase tracking-wider text-[10px] mb-1">Lý do bị từ chối</div>
                                <div>{profile.rejectionReason}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 h-full">
                    {[
                        { label: 'Liên hệ Email', value: profile?.email || '-', icon: EnvelopeIcon },
                        { label: 'Số điện thoại', value: profile?.phone || 'Chưa cập nhật', icon: PhoneIcon },
                        { label: 'Chứng chỉ hiện có', value: `${profile?.documents?.length ?? 0} Tài liệu`, icon: DocumentTextIcon },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card p-6 flex items-center gap-5 border-none shadow-lg bg-white transition-all hover:translate-x-2">
                            <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10B981]">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                                <div className="mt-1 text-sm font-black text-slate-900">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
                <div className="luxury-card p-10 border-none shadow-xl bg-white">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kinh nghiệm chuyên môn</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cập nhật năng lực chăm sóc</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10B981]">
                            <AcademicCapIcon className="h-6 w-6" />
                        </div>
                    </div>

                    <form onSubmit={updateProfile} className="space-y-8">
                        <div>
                            <label className="form-label">Giới thiệu bản thân chuyên nghiệp</label>
                            <textarea className="w-full bg-slate-50 border-none rounded-lg py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all min-h-[160px] resize-none" rows={5} value={formData.bio} onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Chia sẻ về kinh nghiệm, thế mạnh và tâm thế phục vụ của bạn..." />
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="form-label">Số năm kinh nghiệm</label>
                                <input type="number" className="w-full bg-slate-50 border-none rounded-lg py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.yearsExperience} onChange={(event) => setFormData((prev) => ({ ...prev, yearsExperience: Number(event.target.value) || 0 }))} />
                            </div>
                            <div>
                                <label className="form-label">Bán kính phục vụ (km)</label>
                                <input type="number" className="w-full bg-slate-50 border-none rounded-lg py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.serviceRadiusKm} onChange={(event) => setFormData((prev) => ({ ...prev, serviceRadiusKm: Number(event.target.value) || 0 }))} />
                            </div>
                        </div>
                        <button type="submit" className="bg-[#10B981] text-white w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all" disabled={saving}>
                            {saving ? 'Đang đồng bộ...' : 'Xác nhận lưu thay đổi hồ sơ'}
                        </button>
                    </form>
                </div>

                <div className="space-y-12">
                    <div className="luxury-card p-10 border-none shadow-xl bg-white">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Xác minh danh tính</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bổ sung hồ sơ năng lực</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10B981]">
                                <IdentificationIcon className="h-6 w-6" />
                            </div>
                        </div>
                        <form onSubmit={uploadDocument} className="space-y-6">
                            <div className="rounded-lg bg-slate-50 p-4 text-xs font-semibold text-slate-700">
                                Checklist hồ sơ: CCCD trước ({hasFront ? 'Đủ' : 'Thiếu'}), CCCD sau ({hasBack ? 'Đủ' : 'Thiếu'}), Chứng chỉ ({hasCertificate ? 'Đủ' : 'Thiếu'})
                            </div>
                            <div>
                                <label className="form-label">Phân loại tài liệu</label>
                                <select className="w-full bg-slate-50 border-none rounded-lg py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={docType} onChange={(event) => setDocType(event.target.value)}>
                                    <option value="id_card_front">Căn cước công dân (Mặt trước)</option>
                                    <option value="id_card_back">Căn cước công dân (Mặt sau)</option>
                                    <option value="certificate">Chứng chỉ hành nghề y tế</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Chọn tệp tài liệu (JPG/PNG)</label>
                                <div className="relative group">
                                    <input type="file" id="doc-upload" className="hidden" accept=".jpg,.jpeg,.png,image/jpeg,image/png" multiple onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))} />
                                    <label htmlFor="doc-upload" className="flex items-center justify-between w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg py-4 px-6 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                                        <span className={`text-sm font-bold ${selectedFiles.length ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {selectedFiles.length ? `Đã chọn ${selectedFiles.length} tệp` : 'Nhấn để chọn tệp...'}
                                        </span>
                                        <DocumentTextIcon className="h-5 w-5 text-slate-300 group-hover:text-[#10B981]" />
                                    </label>
                                </div>
                                <p className="mt-2 text-[10px] font-medium text-slate-400 italic">Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 5MB.</p>
                            </div>
                            <button type="submit" className="w-full py-4 rounded-xl flex items-center justify-center gap-3 border-2 border-emerald-100 text-[#10B981] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all" disabled={uploading}>
                                <PlusIcon className="h-5 w-5 text-[#10B981]" />
                                {uploading ? 'Đang gửi...' : profile?.isVerified === 'rejected' ? 'Gửi lại hồ sơ xác minh' : 'Gửi tài liệu xác minh'}
                            </button>
                            <button type="button" onClick={() => void submitVerification()} disabled={!canSubmit || profile?.verificationSubmissionStatus === 'submitted'} className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-50">
                                {profile?.verificationSubmissionStatus === 'submitted' ? 'Đã gửi, đang chờ duyệt' : 'Gửi duyệt hồ sơ 1 lần'}
                            </button>
                        </form>
                    </div>

                    <div className="luxury-card p-10 border-none shadow-xl bg-white">
                        <div className="mb-10 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Danh mục hồ sơ</h3>
                            <span className="px-4 py-1.5 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                                {profile?.documents?.length ?? 0} Mục
                            </span>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {profile?.documents?.length ? (
                                profile.documents.map((doc: DocumentDto, idx: number) => (
                                    <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="p-6 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-emerald-500/10">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#10B981] shadow-sm">
                                                    <DocumentTextIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {doc.type.replace(/_/g, ' ')}
                                                    </div>
                                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-black text-slate-900 hover:text-[#10B981] transition-colors">
                                                        Xem chi tiết tài liệu
                                                    </a>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${doc.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : doc.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {doc.status === 'approved' ? 'Đã duyệt' : doc.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-12 text-center rounded-xl bg-slate-50/30 border-2 border-dashed border-slate-100">
                                    <DocumentTextIcon className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                                    <p className="text-sm font-bold text-slate-400">Chưa có tài liệu xác minh nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NurseProfile;
