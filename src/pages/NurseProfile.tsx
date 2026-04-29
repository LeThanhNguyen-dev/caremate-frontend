import { useEffect, useState, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import { nurseApi } from '../api/nurseApi';
import type { DocumentDto, NurseProfileDetailDto } from '../types/nurse';
import { 
    AcademicCapIcon, 
    IdentificationIcon,
    DocumentTextIcon,
    PlusIcon,
    EnvelopeIcon,
    PhoneIcon,
    } from '@heroicons/react/24/outline';

const NurseProfile = () => {
    const { showToast } = useToast();
    const [profile, setProfile] = useState<NurseProfileDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({ bio: '', yearsExperience: 0, serviceRadiusKm: 10 });
    const [docType, setDocType] = useState('hospital_certificate');
    const [fileUrl, setFileUrl] = useState('');

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
            showToast('Không th? t?i h? so y tá.', 'error');
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
            showToast('C?p nh?t h? so thành công.', 'success');
            await loadProfile();
        } catch {
            showToast('C?p nh?t h? so th?t b?i.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const uploadDocument = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!fileUrl.trim()) return;
        try {
            setUploading(true);
            await nurseApi.uploadDocument({ type: docType, fileUrl });
            setFileUrl('');
            showToast('Tài li?u dã du?c g?i lên.', 'success');
            await loadProfile();
        } catch {
            showToast('Không th? t?i lên tài li?u.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const profileStatus = profile?.isVerified === 'verified' ? 'Ðã xác minh' : profile?.isVerified === 'rejected' ? 'B? t? ch?i' : 'Ðang ch? duy?t';

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-nurse border-t-transparent"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF]">Ðang t?i h? so...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 selection:bg-nurse/10">
            {/* Header Profile Hero */}
            <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
                <div className="luxury-card bg-[#111827] text-white p-12 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-nurse/10 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="accent-label !bg-white/10 !text-white border-white/10">H? so y tá chuyên nghi?p</div>
                        <h1 className="text-4xl font-black text-white mt-4">{profile?.fullName}</h1>
                        <p className="mt-4 max-w-2xl text-sm font-medium text-white/50 leading-relaxed">
                            Qu?n lý thông tin ngh? nghi?p, kinh nghi?m ph?c v? và b? tài li?u chuyên môn d? duy trì tr?ng thái xác minh trên h? th?ng CareMate.
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                profile?.isVerified === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                                {profileStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 h-full">
                    {[
                        { label: 'Email', value: profile?.email || '-', icon: EnvelopeIcon },
                        { label: 'S? di?n tho?i', value: profile?.phone || 'Chua c?p nh?t', icon: PhoneIcon },
                        { label: 'Tài li?u dã n?p', value: `${profile?.documents?.length ?? 0} m?c`, icon: DocumentTextIcon },
                    ].map((item) => (
                        <div key={item.label} className="luxury-card p-6 flex items-center gap-5 border-none shadow-lg">
                            <div className="h-12 w-12 rounded-2xl bg-nurse/5 flex items-center justify-center text-nurse">
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
                {/* Form Update */}
                <div className="luxury-card p-10 border-none shadow-xl">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#111827]">Thông tin chuyên môn</h3>
                            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">C?p nh?t nang l?c và ph?m vi ph?c v?</p>
                        </div>
                        <AcademicCapIcon className="h-8 w-8 text-nurse/20" />
                    </div>

                    <form onSubmit={updateProfile} className="space-y-8">
                        <div>
                            <label className="form-label">Gi?i thi?u b?n thân</label>
                            <textarea 
                                className="form-input min-h-[160px] resize-none py-4" 
                                rows={5} 
                                value={formData.bio} 
                                onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))} 
                                placeholder="Mô t? kinh nghi?m, th? m?nh và phong cách ph?c v? c?a b?n..." 
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="form-label">S? nam kinh nghi?m</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    value={formData.yearsExperience} 
                                    onChange={(event) => setFormData((prev) => ({ ...prev, yearsExperience: Number(event.target.value) || 0 })) } 
                                />
                            </div>
                            <div>
                                <label className="form-label">Bán kính ph?c v? (km)</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    value={formData.serviceRadiusKm} 
                                    onChange={(event) => setFormData((prev) => ({ ...prev, serviceRadiusKm: Number(event.target.value) || 0 })) } 
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full py-4 rounded-2xl shadow-lg shadow-nurse/20" disabled={saving}>
                            {saving ? 'Ðang luu...' : 'Luu thay d?i h? so'}
                        </button>
                    </form>
                </div>

                <div className="space-y-12">
                    {/* Upload Section */}
                    <div className="luxury-card p-10 border-none shadow-xl">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-[#111827]">G?i tài li?u xác minh</h3>
                                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">B? sung h? so nang l?c</p>
                            </div>
                            <IdentificationIcon className="h-8 w-8 text-nurse/20" />
                        </div>
                        <form onSubmit={uploadDocument} className="space-y-6">
                            <div>
                                <label className="form-label">Lo?i tài li?u</label>
                                <select 
                                    className="form-input appearance-none bg-slate-50" 
                                    value={docType} 
                                    onChange={(event) => setDocType(event.target.value)}
                                >
                                    <option value="id_card">CCCD / CMND</option>
                                    <option value="hospital_certificate">Ch?ng ch? hành ngh?</option>
                                    <option value="degree">B?ng c?p chuyên môn</option>
                                    <option value="other">Tài li?u khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Ðu?ng d?n file (URL)</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    value={fileUrl} 
                                    onChange={(event) => setFileUrl(event.target.value)} 
                                    placeholder="https://cloud.caremate.com/docs/my-cert.pdf" 
                                />
                            </div>
                            <button type="submit" className="btn-secondary w-full py-4 rounded-2xl flex items-center justify-center gap-2" disabled={uploading}>
                                <PlusIcon className="h-5 w-5" />
                                {uploading ? 'Ðang g?i...' : 'G?i tài li?u'}
                            </button>
                        </form>
                    </div>

                    {/* History Section */}
                    <div className="luxury-card p-10 border-none shadow-xl">
                        <div className="mb-10 flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#111827]">Danh sách tài li?u</h3>
                            <span className="px-4 py-1 rounded-full bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {profile?.documents?.length ?? 0} M?c
                            </span>
                        </div>
                        <div className="space-y-4">
                            {profile?.documents?.length ? (
                                profile.documents.map((doc: DocumentDto) => (
                                    <div key={doc.id} className="p-6 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-nurse shadow-sm">
                                                    <DocumentTextIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        {doc.type.replace(/_/g, ' ')}
                                                    </div>
                                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-black text-slate-900 hover:text-nurse">
                                                        Xem tài li?u
                                                    </a>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                doc.status === 'approved' ? 'bg-green-50 text-green-600' : 
                                                doc.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {doc.status === 'approved' ? 'Ðã duy?t' : doc.status === 'rejected' ? 'B? t? ch?i' : 'Ch? duy?t'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center rounded-3xl bg-slate-50/30 border-2 border-dashed border-slate-100">
                                    <DocumentTextIcon className="h-10 w-10 mx-auto text-slate-200 mb-4" />
                                    <p className="text-sm font-bold text-slate-400">Chua có tài li?u nào du?c g?i lên.</p>
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


