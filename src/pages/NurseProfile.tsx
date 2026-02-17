import { useState, useEffect } from 'react';
import { nurseApi } from '../api/nurseApi';
import type { NurseProfileDetailDto, DocumentDto } from '../types/nurse';
import './NurseProfile.css';

const ShieldCheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-shield">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-clock">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-upload">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const FileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-file">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);

const NurseProfile = () => {
    const [profile, setProfile] = useState<NurseProfileDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        yearsExperience: 0,
        serviceRadiusKm: 10
    });
    const [uploading, setUploading] = useState(false);
    const [docType, setDocType] = useState('hospital_certificate');
    const [fileUrl, setFileUrl] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await nurseApi.getProfile();
            setProfile(data);
            setFormData({
                bio: data.bio || '',
                yearsExperience: data.yearsExperience || 0,
                serviceRadiusKm: data.serviceRadiusKm || 10
            });
        } catch (err) {
            setError('Không thể tải thông tin hồ sơ.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setError('');
        try {
            await nurseApi.updateProfile(formData);
            await fetchProfile();
            alert('Cập nhật hồ sơ thành công!');
        } catch (err) {
            setError('Cập nhật hồ sơ thất bại.');
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileUrl) return;
        setUploading(true);
        try {
            await nurseApi.uploadDocument({ type: docType, fileUrl });
            await fetchProfile();
            setFileUrl('');
            alert('Tải tài liệu thành công!');
        } catch (err) {
            setError('Tải tài liệu thất bại.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="loading-state">Đang tải hồ sơ...</div>;

    return (
        <div className="nurse-profile-container">
            <header className="profile-header">
                <div className="header-content">
                    <h1>Hồ sơ Điều dưỡng</h1>
                    <p>Quản lý thông tin cá nhân và tài liệu chuyên môn của bạn</p>
                </div>
                <div className={`status-badge ${profile?.isVerified}`}>
                    <ShieldCheckIcon />
                    <span>
                        {profile?.isVerified === 'verified' ? 'Đã xác minh' :
                            profile?.isVerified === 'rejected' ? 'Bị từ chối' : 'Chờ xác minh'}
                    </span>
                </div>
            </header>

            <div className="profile-grid">
                {/* Profile Information Section */}
                <section className="profile-section basic-info">
                    <h2><ClockIcon /> Thông tin cơ bản</h2>
                    <div className="info-card">
                        <div className="user-details">
                            <h3>{profile?.fullName}</h3>
                            <p className="email">{profile?.email}</p>
                            <p className="phone">{profile?.phone}</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="update-form">
                            <div className="form-group">
                                <label>Giới thiệu bản thân (Bio)</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Chia sẻ kinh nghiệm và kỹ năng của bạn..."
                                    rows={4}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số năm kinh nghiệm</label>
                                    <input
                                        type="number"
                                        value={formData.yearsExperience}
                                        onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bán kính phục vụ (km)</label>
                                    <input
                                        type="number"
                                        value={formData.serviceRadiusKm}
                                        onChange={(e) => setFormData({ ...formData, serviceRadiusKm: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="save-btn" disabled={isUpdating}>
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Documents Section */}
                <section className="profile-section documents">
                    <h2><FileIcon /> Tài liệu chuyên môn</h2>

                    <div className="upload-box">
                        <h3>Tải lên tài liệu mới</h3>
                        <form onSubmit={handleUploadDoc} className="upload-form">
                            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                                <option value="id_card">Chứng minh nhân dân / CCCD</option>
                                <option value="hospital_certificate">Chứng chỉ hành nghề</option>
                                <option value="degree">Bằng cấp chuyên môn</option>
                                <option value="other">Tài liệu khác</option>
                            </select>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Dán link file tài liệu (URL)..."
                                    value={fileUrl}
                                    onChange={(e) => setFileUrl(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={uploading}>
                                    <UploadIcon /> {uploading ? 'Đang tải...' : 'Tải lên'}
                                </button>
                            </div>
                            <small>Lưu ý: Bạn nên tải lên các tài liệu chứng minh năng lực để được duyệt hồ sơ nhanh hơn.</small>
                        </form>
                    </div>

                    <div className="doc-list">
                        <h3>Tài liệu đã tải lên</h3>
                        {profile?.documents && profile.documents.length > 0 ? (
                            <div className="doc-grid">
                                {profile.documents.map((doc: DocumentDto) => (
                                    <div key={doc.id} className="doc-item">
                                        <div className="doc-info">
                                            <span className="doc-type-label">{doc.type.replace('_', ' ').toUpperCase()}</span>
                                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="view-link">Xem tài liệu</a>
                                        </div>
                                        <div className={`doc-status ${doc.status}`}>
                                            {doc.status === 'approved' ? 'Đã duyệt' :
                                                doc.status === 'rejected' ? 'Bị từ chối' : 'Đang chờ duyệt'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-docs">Chưa có tài liệu nào được tải lên.</p>
                        )}
                    </div>
                </section>
            </div>
            {error && <div className="global-error">{error}</div>}
        </div>
    );
};

export default NurseProfile;
