import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    IdentificationIcon,
    DocumentTextIcon,
    PlusIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon,
    CameraIcon,
    FunnelIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';
import { nurseApi } from '../api/nurseApi';
import type { CccdOcrResultDto, DocumentDto, NurseProfileDetailDto } from '../types/nurse';
import { getErrorMessage } from '../utils/apiError';
import bankApi from '../api/bankApi';
import type { BankOptionDto } from '../api/frontend-api-contract';
import goongApi, { createGoongSessionToken, extractGoongAddressParts, type GoongPrediction } from '../api/goongApi';

const toSafeText = (value: unknown) => (typeof value === 'string' ? value : value == null ? '' : String(value));

const toCoordinateText = (value: number | null | undefined) => (value != null && Number.isFinite(value) ? String(value) : '');

const parseCoordinate = (value: unknown) => {
    const text = toSafeText(value).trim();
    const parsed = Number(text);
    return text && Number.isFinite(parsed) ? parsed : null;
};

const isCccdDocumentType = (type: string) => type === 'id_card_front' || type === 'id_card_back';

const cccdOcrFields: Array<{ key: keyof CccdOcrResultDto; label: string }> = [
    { key: 'idNumber', label: 'Số CCCD' },
    { key: 'fullName', label: 'Họ tên' },
    { key: 'dateOfBirth', label: 'Ngày sinh' },
    { key: 'gender', label: 'Giới tính' },
    { key: 'nationality', label: 'Quốc tịch' },
    { key: 'placeOfOrigin', label: 'Quê quán' },
    { key: 'placeOfResidence', label: 'Nơi thường trú' },
    { key: 'dateOfIssue', label: 'Ngày cấp' },
    { key: 'dateOfExpiry', label: 'Có giá trị đến' },
    { key: 'issuingAuthority', label: 'Nơi cấp' },
];

const deriveAddressLine = (fullAddress: unknown, ward?: unknown, district?: unknown) => {
    const wardText = toSafeText(ward).toLocaleLowerCase('vi-VN');
    const districtText = toSafeText(district).toLocaleLowerCase('vi-VN');

    return toSafeText(fullAddress)
        .split(',')
        .map((segment) => segment.trim())
        .filter(Boolean)
        .filter((segment) => {
            const normalized = segment.toLocaleLowerCase('vi-VN');
            return normalized !== 'đà nẵng' &&
                normalized !== 'việt nam' &&
                normalized !== wardText &&
                normalized !== districtText &&
                !normalized.startsWith('phường ') &&
                !normalized.startsWith('xã ') &&
                !normalized.startsWith('quận ') &&
                !normalized.startsWith('huyện ');
        })
        .join(', ');
};

const composeFullAddress = (addressLine: unknown, ward: unknown, district: unknown, fallbackAddress: unknown) => {
    const parts = [addressLine, ward, district, 'Đà Nẵng']
        .map(toSafeText)
        .filter(Boolean);

    return parts.length > 1 ? Array.from(new Set(parts)).join(', ') : toSafeText(fallbackAddress);
};

const NurseProfile = () => {
    const { showToast } = useToast();
    const [profile, setProfile] = useState<NurseProfileDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', avatar: '', bio: '', specialization: '', yearsExperience: 0, serviceRadiusKm: 10, bankBin: '', bankAccountNumber: '', bankAccountName: '', address: '', addressLine: '', ward: '', district: '', latitude: '', longitude: '' });
    const [docType, setDocType] = useState('id_card_front');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [cccdOcrResult, setCccdOcrResult] = useState<CccdOcrResultDto | null>(null);
    const [cccdOcrLoading, setCccdOcrLoading] = useState(false);
    const [banks, setBanks] = useState<BankOptionDto[]>([]);
    const [reviewCategory, setReviewCategory] = useState('all');
    const [addressSuggestions, setAddressSuggestions] = useState<GoongPrediction[]>([]);
    const [addressSuggestionsOpen, setAddressSuggestionsOpen] = useState(false);
    const [addressLookupLoading, setAddressLookupLoading] = useState(false);
    const [addressLookupError, setAddressLookupError] = useState('');
    const goongSessionTokenRef = useRef(createGoongSessionToken());
    const suppressNextAddressLookupRef = useRef(false);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await nurseApi.getProfile();
            setProfile(data);
            setFormData({
                fullName: data.fullName || '',
                phoneNumber: data.phone || '',
                avatar: data.avatar || '',
                bio: data.bio || '',
                specialization: data.specialization || '',
                yearsExperience: data.yearsExperience || 0,
                serviceRadiusKm: data.serviceRadiusKm || 10,
                bankBin: data.bankBin || '',
                bankAccountNumber: data.bankAccountNumber || '',
                bankAccountName: data.bankAccountName || '',
                address: data.address || data.defaultAddress?.fullAddress || '',
                addressLine: deriveAddressLine(data.address || data.defaultAddress?.fullAddress, data.ward || data.defaultAddress?.ward, data.district || data.defaultAddress?.district),
                ward: data.ward || data.defaultAddress?.ward || '',
                district: data.district || data.defaultAddress?.district || '',
                latitude: toCoordinateText(data.latitude ?? data.defaultAddress?.latitude),
                longitude: toCoordinateText(data.longitude ?? data.defaultAddress?.longitude),
            });
        } catch {
            showToast('Không thể tải hồ sơ điều dưỡng.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void loadProfile();
        void bankApi.getBanks().then(setBanks).catch(() => undefined);
    }, [loadProfile]);

    useEffect(() => {
        const input = toSafeText(formData.address).trim();

        if (suppressNextAddressLookupRef.current) {
            suppressNextAddressLookupRef.current = false;
            setAddressSuggestions([]);
            setAddressSuggestionsOpen(false);
            setAddressLookupLoading(false);
            setAddressLookupError('');
            return;
        }

        if (!goongApi.hasApiKey || input.length < 3) {
            setAddressSuggestions([]);
            setAddressLookupLoading(false);
            setAddressLookupError('');
            return;
        }

        const abortController = new AbortController();
        const timeoutId = window.setTimeout(() => {
            setAddressLookupLoading(true);
            void goongApi
                .autocomplete(input, goongSessionTokenRef.current, abortController.signal)
                .then((suggestions) => {
                    setAddressSuggestions(suggestions);
                    setAddressLookupError(suggestions.length === 0 ? 'Không tìm thấy gợi ý địa chỉ phù hợp.' : '');
                })
                .catch((error: unknown) => {
                    if (!(error instanceof DOMException && error.name === 'AbortError')) {
                        setAddressSuggestions([]);
                        setAddressLookupError('Không thể tải gợi ý Goong. Hãy kiểm tra GOONG_API_KEY ở backend.');
                    }
                })
                .finally(() => {
                    if (!abortController.signal.aborted) {
                        setAddressLookupLoading(false);
                    }
                });
        }, 350);

        return () => {
            window.clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [formData.address]);

    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        suppressNextAddressLookupRef.current = false;
        setFormData((prev) => ({
            ...prev,
            address: event.target.value,
            addressLine: event.target.value,
            latitude: '',
            longitude: '',
        }));
        setAddressLookupError('');
        setAddressSuggestionsOpen(true);
    };

    const handleSelectAddress = async (suggestion: GoongPrediction) => {
        const fallbackAddress = toSafeText(suggestion.description);
        const placeId = toSafeText(suggestion.place_id);

        if (!fallbackAddress || !placeId) {
            setAddressLookupError('Gợi ý địa chỉ không hợp lệ. Vui lòng nhập lại địa chỉ.');
            return;
        }

        suppressNextAddressLookupRef.current = true;
        setFormData((prev) => ({ ...prev, address: fallbackAddress }));
        setAddressSuggestionsOpen(false);
        setAddressSuggestions([]);

        try {
            const detail = await goongApi.getPlaceDetail(placeId, goongSessionTokenRef.current);
            const addressParts = extractGoongAddressParts(detail, fallbackAddress);
            const nextAddressLine = toSafeText(addressParts.streetAddress) || deriveAddressLine(addressParts.fullAddress, addressParts.ward, addressParts.district);
            suppressNextAddressLookupRef.current = true;
            setFormData((prev) => ({
                ...prev,
                address: toSafeText(addressParts.fullAddress) || fallbackAddress,
                addressLine: nextAddressLine,
                ward: toSafeText(addressParts.ward),
                district: toSafeText(addressParts.district),
                latitude: toCoordinateText(addressParts.latitude),
                longitude: toCoordinateText(addressParts.longitude),
            }));
            goongSessionTokenRef.current = createGoongSessionToken();
            setAddressSuggestionsOpen(false);
            setAddressSuggestions([]);
        } catch {
            suppressNextAddressLookupRef.current = true;
            setFormData((prev) => ({ ...prev, address: fallbackAddress }));
            setAddressLookupError('Không thể lấy chi tiết địa chỉ từ Goong.');
            setAddressSuggestionsOpen(false);
            setAddressSuggestions([]);
        }
    };

    const updateProfile = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSaving(true);
            await nurseApi.updateProfile({
                ...formData,
                address: composeFullAddress(formData.addressLine, formData.ward, formData.district, formData.address),
                latitude: parseCoordinate(formData.latitude),
                longitude: parseCoordinate(formData.longitude),
            });
            showToast('Cập nhật hồ sơ thành công.', 'success');
            await loadProfile();
        } catch {
            showToast('Cập nhật hồ sơ thất bại.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const uploadAvatar = async (file?: File) => {
        if (!file) return;

        try {
            setAvatarUploading(true);
            const avatar = await nurseApi.uploadAvatar(file);
            setFormData((prev) => ({ ...prev, avatar }));
            showToast('Ảnh đại diện đã được cập nhật.', 'success');
            await loadProfile();
        } catch (err) {
            showToast(getErrorMessage(err, 'Không thể tải ảnh đại diện.'), 'error');
        } finally {
            setAvatarUploading(false);
        }
    };

    const runCccdOcr = async (file: File, type = docType) => {
        try {
            setCccdOcrLoading(true);
            const result = await nurseApi.ocrCccd(type, file);
            setCccdOcrResult(result);

            if (result.isIdentityCard) {
                showToast('Đã OCR ảnh CCCD bằng FPT AI.', 'success');
            } else {
                showToast(result.warning || 'FPT AI chưa nhận diện đây là CCCD.', 'error');
            }

            return result;
        } catch (err) {
            setCccdOcrResult(null);
            showToast(getErrorMessage(err, 'Không thể OCR ảnh CCCD bằng FPT AI.'), 'error');
            return null;
        } finally {
            setCccdOcrLoading(false);
        }
    };

    const handleDocumentFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
        setCccdOcrResult(null);

        if (files.length === 1 && isCccdDocumentType(docType)) {
            void runCccdOcr(files[0], docType);
        }
    };

    const handleDocumentTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextType = event.target.value;
        setDocType(nextType);
        setCccdOcrResult(null);

        if (selectedFiles.length === 1 && isCccdDocumentType(nextType)) {
            void runCccdOcr(selectedFiles[0], nextType);
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
            if (isCccdDocumentType(docType)) {
                const ocrResult = cccdOcrResult ?? await runCccdOcr(selectedFiles[0], docType);
                if (!ocrResult?.isIdentityCard) {
                    showToast(ocrResult?.warning || 'Ảnh được chọn chưa giống CCCD. Vui lòng kiểm tra lại.', 'error');
                    return;
                }
            }

            await nurseApi.uploadDocuments({ type: docType, files: selectedFiles });
            setSelectedFiles([]);
            setCccdOcrResult(null);
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
    const isSubmitted = profile?.verificationSubmissionStatus === 'submitted';
    const isApproved = profile?.verificationSubmissionStatus === 'approved' || profile?.isVerified === 'verified';
    const canChangeDocuments = !isSubmitted && !isApproved;
    const canSubmit = hasFront && hasBack && hasCertificate && canChangeDocuments;
    const reviews = profile?.reviews ?? [];
    const reviewCategories = useMemo(
        () => Array.from(new Set(reviews.map((review) => review.serviceCategory || review.serviceName).filter(Boolean))),
        [reviews],
    );
    const filteredReviews = useMemo(
        () => reviewCategory === 'all'
            ? reviews
            : reviews.filter((review) => (review.serviceCategory || review.serviceName) === reviewCategory),
        [reviewCategory, reviews],
    );
    const averageRating = profile?.averageRating ?? (reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0);

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
                        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
                                {profile?.avatar ? (
                                    <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white/70">
                                        {profile?.fullName?.charAt(0) || 'Y'}
                                    </div>
                                )}
                                <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1 bg-black/55 py-2 text-[9px] font-black uppercase tracking-widest text-white">
                                    <CameraIcon className="h-3.5 w-3.5" />
                                    {avatarUploading ? 'Đang tải' : 'Đổi ảnh'}
                                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={(event) => void uploadAvatar(event.target.files?.[0])} disabled={avatarUploading} />
                                </label>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">{profile?.fullName}</h1>
                                <p className="mt-2 text-sm font-bold text-white/45">{profile?.specialization || 'Chưa cập nhật chuyên môn hiển thị'}</p>
                            </div>
                        </div>
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
                            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#10B981]">
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
                <div data-tour="nurse-profile-form" className="luxury-card p-10 border-none shadow-xl bg-white">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kinh nghiệm chuyên môn</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cập nhật năng lực chăm sóc</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#10B981]">
                            <AcademicCapIcon className="h-6 w-6" />
                        </div>
                    </div>

                    <form onSubmit={updateProfile} className="space-y-8">
                        <div>
                            <label className="form-label">Giới thiệu bản thân chuyên nghiệp</label>
                            <textarea className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all min-h-[160px] resize-none" rows={5} value={formData.bio} onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))} placeholder="Chia sẻ về kinh nghiệm, thế mạnh và tâm thế phục vụ của bạn..." />
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="form-label">Tên hiển thị với khách</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.fullName} onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))} />
                            </div>
                            <div>
                                <label className="form-label">Số điện thoại liên hệ</label>
                                <input type="tel" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.phoneNumber} onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="form-label">Chuyên môn hiển thị</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.specialization} onChange={(event) => setFormData((prev) => ({ ...prev, specialization: event.target.value }))} placeholder="VD: Chăm sóc mẹ sau sinh, massage bé, tư vấn nuôi con bằng sữa mẹ" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="form-label">Địa chỉ làm việc chính</label>
                                <div className="relative">
                                    <MapPinIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-xl py-4 pl-14 pr-12 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all"
                                        value={formData.address}
                                        onBlur={() => window.setTimeout(() => setAddressSuggestionsOpen(false), 150)}
                                        onChange={handleAddressChange}
                                        onFocus={() => setAddressSuggestionsOpen(addressSuggestions.length > 0)}
                                        placeholder="Nhập địa chỉ để Goong gợi ý, ví dụ: 344 Nguyễn Hữu Thọ, Đà Nẵng"
                                    />
                                    {addressLookupLoading && (
                                        <div className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                    )}
                                    {addressSuggestionsOpen && addressSuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                                            {addressSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion.place_id}
                                                    type="button"
                                                    onMouseDown={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                    }}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        void handleSelectAddress(suggestion);
                                                    }}
                                                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-emerald-50"
                                                >
                                                    <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#10B981]" />
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-[14px] font-bold text-slate-900">
                                                            {toSafeText(suggestion.structured_formatting?.main_text) || toSafeText(suggestion.description)}
                                                        </span>
                                                        {toSafeText(suggestion.structured_formatting?.secondary_text) && (
                                                            <span className="mt-0.5 block truncate text-[12px] font-medium text-slate-500">
                                                                {toSafeText(suggestion.structured_formatting?.secondary_text)}
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {addressLookupError && (
                                    <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-700">
                                        {addressLookupError}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="form-label">Quận/Huyện</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.district} onChange={(event) => setFormData((prev) => ({ ...prev, district: event.target.value, address: composeFullAddress(prev.addressLine, prev.ward, event.target.value, prev.address) }))} placeholder="Ví dụ: Cẩm Lệ" />
                            </div>
                            <div>
                                <label className="form-label">Phường/Xã</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.ward} onChange={(event) => setFormData((prev) => ({ ...prev, ward: event.target.value, address: composeFullAddress(prev.addressLine, event.target.value, prev.district, prev.address) }))} placeholder="Ví dụ: Khuê Trung" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="form-label">Số nhà, tên đường</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.addressLine} onChange={(event) => setFormData((prev) => ({ ...prev, addressLine: event.target.value, address: composeFullAddress(event.target.value, prev.ward, prev.district, prev.address) }))} placeholder="Ví dụ: 344 Nguyễn Hữu Thọ" />
                            </div>
                            <div>
                                <label className="form-label">Vĩ độ</label>
                                <input type="number" step="any" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.latitude} onChange={(event) => setFormData((prev) => ({ ...prev, latitude: event.target.value }))} />
                            </div>
                            <div>
                                <label className="form-label">Kinh độ</label>
                                <input type="number" step="any" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.longitude} onChange={(event) => setFormData((prev) => ({ ...prev, longitude: event.target.value }))} />
                            </div>
                            <div>
                                <label className="form-label">Số năm kinh nghiệm</label>
                                <input type="number" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.yearsExperience} onChange={(event) => setFormData((prev) => ({ ...prev, yearsExperience: Number(event.target.value) || 0 }))} />
                            </div>
                            <div>
                                <label className="form-label">Bán kính phục vụ (km)</label>
                                <input type="number" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.serviceRadiusKm} onChange={(event) => setFormData((prev) => ({ ...prev, serviceRadiusKm: Number(event.target.value) || 0 }))} />
                            </div>
                            <div>
                                <label className="form-label">Ngân hàng nhận tiền</label>
                                <select className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.bankBin} onChange={(event) => setFormData((prev) => ({ ...prev, bankBin: event.target.value }))}>
                                    <option value="">Chọn ngân hàng</option>
                                    {banks.map((bank) => (
                                        <option key={bank.code} value={bank.code}>{bank.shortName || bank.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Số tài khoản nhận tiền</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.bankAccountNumber} onChange={(event) => setFormData((prev) => ({ ...prev, bankAccountNumber: event.target.value }))} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="form-label">Tên chủ tài khoản</label>
                                <input type="text" className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all" value={formData.bankAccountName} onChange={(event) => setFormData((prev) => ({ ...prev, bankAccountName: event.target.value }))} />
                            </div>
                        </div>
                        <button type="submit" className="bg-[#10B981] text-white w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all" disabled={saving}>
                            {saving ? 'Đang đồng bộ...' : 'Xác nhận lưu thay đổi hồ sơ'}
                        </button>
                    </form>
                </div>

                <div className="space-y-12">
                    <div data-tour="nurse-profile-documents" className="luxury-card p-10 border-none shadow-xl bg-white">
                        <div className="mb-10 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Xác minh danh tính</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bổ sung hồ sơ năng lực</p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#10B981]">
                                <IdentificationIcon className="h-6 w-6" />
                            </div>
                        </div>
                        <form onSubmit={uploadDocument} className="space-y-6">
                            <div className="rounded-xl bg-slate-50 p-4 text-xs font-semibold text-slate-700">
                                Checklist hồ sơ: CCCD trước ({hasFront ? 'Đủ' : 'Thiếu'}), CCCD sau ({hasBack ? 'Đủ' : 'Thiếu'}), Chứng chỉ ({hasCertificate ? 'Đủ' : 'Thiếu'})
                            </div>
                            <div>
                                <label className="form-label">Phân loại tài liệu</label>
                                <select className="w-full bg-slate-50 border-none rounded-xl py-4 px-6 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all disabled:opacity-50" value={docType} onChange={handleDocumentTypeChange} disabled={!canChangeDocuments}>
                                    <option value="id_card_front">Căn cước công dân (Mặt trước)</option>
                                    <option value="id_card_back">Căn cước công dân (Mặt sau)</option>
                                    <option value="certificate">Chứng chỉ hành nghề y tế</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Chọn tệp tài liệu (JPG/PNG)</label>
                                <div className="relative group">
                                    <input type="file" id="doc-upload" className="hidden" accept=".jpg,.jpeg,.png,image/jpeg,image/png" multiple disabled={!canChangeDocuments} onChange={handleDocumentFilesChange} />
                                    <label htmlFor="doc-upload" className="flex items-center justify-between w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl py-4 px-6 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                                        <span className={`text-sm font-bold ${selectedFiles.length ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {selectedFiles.length ? `Đã chọn ${selectedFiles.length} tệp` : 'Nhấn để chọn tệp...'}
                                        </span>
                                        <DocumentTextIcon className="h-5 w-5 text-slate-300 group-hover:text-[#10B981]" />
                                    </label>
                                </div>
                                <p className="mt-2 text-[10px] font-medium text-slate-400 italic">Hỗ trợ định dạng JPG, PNG. Dung lượng tối đa 5MB.</p>
                            </div>
                            {isCccdDocumentType(docType) && selectedFiles.length === 1 && (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">FPT AI OCR CCCD</div>
                                            <div className="mt-1 text-xs font-bold text-slate-500">
                                                {cccdOcrLoading
                                                    ? 'Đang đọc thông tin từ ảnh...'
                                                    : cccdOcrResult
                                                      ? `Độ tin cậy ${cccdOcrResult.confidenceScore}%`
                                                      : 'Chưa có kết quả OCR.'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => void runCccdOcr(selectedFiles[0], docType)}
                                            disabled={cccdOcrLoading}
                                            className="shrink-0 rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-sm disabled:opacity-50"
                                        >
                                            {cccdOcrLoading ? 'Đang quét' : 'Quét lại'}
                                        </button>
                                    </div>
                                    {cccdOcrResult && (
                                        <div className="mt-4 space-y-3">
                                            {cccdOcrResult.warning && (
                                                <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                                                    {cccdOcrResult.warning}
                                                </div>
                                            )}
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {cccdOcrFields
                                                    .map((field) => ({ ...field, value: cccdOcrResult[field.key] }))
                                                    .filter((field) => typeof field.value === 'string' && field.value.trim())
                                                    .map((field) => (
                                                        <div key={field.key} className="rounded-xl bg-white px-4 py-3">
                                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{field.label}</div>
                                                            <div className="mt-1 text-sm font-black text-slate-900">{field.value}</div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button type="submit" className="w-full py-4 rounded-xl flex items-center justify-center gap-3 border-2 border-emerald-100 text-[#10B981] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent" disabled={uploading || !canChangeDocuments}>
                                <PlusIcon className="h-5 w-5 text-[#10B981]" />
                                {uploading ? 'Đang gửi...' : isApproved ? 'Hồ sơ đã xác minh' : isSubmitted ? 'Đang chờ duyệt' : profile?.isVerified === 'rejected' ? 'Gửi lại hồ sơ xác minh' : 'Gửi tài liệu xác minh'}
                            </button>
                            <button type="button" onClick={() => void submitVerification()} disabled={!canSubmit} className="w-full py-4 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-50">
                                {isApproved ? 'Hồ sơ đã được duyệt' : isSubmitted ? 'Đã gửi, đang chờ duyệt' : 'Gửi duyệt hồ sơ 1 lần'}
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

            <section className="luxury-card border-none bg-white p-10 shadow-xl">
                <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">
                            <SolidStarIcon className="h-4 w-4" />
                            Đánh giá khách hàng
                        </div>
                        <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">Hồ sơ đánh giá của y tá</h3>
                        <p className="mt-2 text-sm font-bold text-slate-400">
                            {reviews.length} đánh giá • trung bình {averageRating.toFixed(1)}/5 sao
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-12 items-center gap-2 rounded-xl bg-slate-50 px-4 text-slate-400">
                            <FunnelIcon className="h-5 w-5" />
                            <select
                                className="bg-transparent text-sm font-black text-slate-700 outline-none"
                                value={reviewCategory}
                                onChange={(event) => setReviewCategory(event.target.value)}
                            >
                                <option value="all">Tất cả danh mục</option>
                                {reviewCategories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {filteredReviews.length ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {filteredReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white text-sm font-black text-[#10B981] shadow-sm">
                                            {review.customerAvatar ? (
                                                <img src={review.customerAvatar} alt={review.customerName} className="h-full w-full object-cover" />
                                            ) : (
                                                review.customerName?.charAt(0) || 'K'
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{review.customerName || 'Khách hàng'}</div>
                                            <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {review.serviceCategory || review.serviceName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-amber-400 shadow-sm">
                                        {Array.from({ length: 5 }, (_, index) => (
                                            <SolidStarIcon key={index} className={`h-4 w-4 ${index < review.rating ? 'text-amber-400' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-5 text-sm font-semibold leading-7 text-slate-600">
                                    {review.comment || 'Khách hàng chưa để lại nhận xét chi tiết.'}
                                </p>
                                <div className="mt-5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>{review.serviceName}</span>
                                    <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/40 py-14 text-center">
                        <SolidStarIcon className="mx-auto h-10 w-10 text-slate-200" />
                        <p className="mt-4 text-sm font-bold text-slate-400">Chưa có đánh giá nào trong danh mục này.</p>
                    </div>
                )}
            </section>

            <section className="luxury-card border-none bg-white p-10 shadow-xl">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">
                        <AcademicCapIcon className="h-4 w-4" />
                        Thống kê hiệu suất
                    </div>
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">Tổng quan hoạt động</h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-slate-50 p-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đánh giá</div>
                        <div className="mt-2 flex items-center gap-2">
                            <SolidStarIcon className="h-6 w-6 text-amber-400" />
                            <span className="text-3xl font-black text-slate-900">{averageRating.toFixed(1)}</span>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lượt đánh giá</div>
                        <div className="mt-2 text-3xl font-black text-slate-900">{reviews.length}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kinh nghiệm</div>
                        <div className="mt-2 text-3xl font-black text-slate-900">{profile?.yearsExperience ?? 0} <span className="text-lg font-black text-slate-400">năm</span></div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hồ sơ</div>
                        <div className="mt-2 text-3xl font-black text-slate-900">{profile?.documents?.length ?? 0} <span className="text-lg font-black text-slate-400">tệp</span></div>
                    </div>
                </div>

                {profile?.ratingDistribution && Object.keys(profile.ratingDistribution).length > 0 && (
                    <div className="mt-8">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Phân bổ đánh giá</div>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const dist = profile.ratingDistribution as Record<string, number>;
                                const count = dist[String(star)] ?? 0;
                                const maxCount = Math.max(...Object.values(dist), 1);
                                const pct = (count / maxCount) * 100;
                                return (
                                    <div key={star} className="flex items-center gap-3">
                                        <span className="w-8 text-right text-sm font-black text-slate-500">{star}</span>
                                        <SolidStarIcon className="h-4 w-4 text-amber-400" />
                                        <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <span className="w-6 text-right text-xs font-bold text-slate-400">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default NurseProfile;
