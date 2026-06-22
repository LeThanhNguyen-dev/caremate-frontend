import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import type { CccdOcrResultDto, DocumentDto, NurseDocumentOcrLogDto, NurseProfileDetailDto } from '../types/nurse';
import { getErrorMessage } from '../utils/apiError';
import './AdminNurseDetail.css';

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const isIdCardDocument = (type: string) => type === 'id_card_front' || type === 'id_card_back';

const ocrFields: Array<{ key: keyof CccdOcrResultDto; label: string }> = [
  { key: 'idNumber', label: 'Số CCCD' },
  { key: 'fullName', label: 'Họ tên' },
  { key: 'dateOfBirth', label: 'Ngày sinh' },
  { key: 'gender', label: 'Giới tính' },
  { key: 'nationality', label: 'Quốc tịch' },
  { key: 'placeOfOrigin', label: 'Quê quán' },
  { key: 'placeOfResidence', label: 'Nơi thường trú' },
  { key: 'dateOfIssue', label: 'Ngày cấp' },
  { key: 'dateOfExpiry', label: 'Ngày hết hạn' },
  { key: 'issuingAuthority', label: 'Nơi cấp' },
];

const AdminNurseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [nurse, setNurse] = useState<NurseProfileDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [comment, setComment] = useState('');
  const [previewDoc, setPreviewDoc] = useState<DocumentDto | null>(null);
  const [ocrLoadingId, setOcrLoadingId] = useState<number | null>(null);
  const [ocrResults, setOcrResults] = useState<Record<number, CccdOcrResultDto>>({});
  const [ocrLogs, setOcrLogs] = useState<NurseDocumentOcrLogDto[]>([]);
  const [docActionId, setDocActionId] = useState<number | null>(null);

  const fetchNurseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [data, logs] = await Promise.all([
        adminApi.getNurseDetails(Number(id)),
        adminApi.getOcrLogs(Number(id)).catch(() => []),
      ]);
      setNurse(data);
      setOcrLogs(logs);
      setOcrResults(Object.fromEntries(
        logs
          .filter((log) => log.result)
          .map((log) => [log.nurseDocumentId, log.result as CccdOcrResultDto])
      ));
    } catch (err) {
      setError(t('adminNurseDetail.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void fetchNurseDetails();
  }, [id, fetchNurseDetails]);

  const handleReview = async (isApproved: boolean) => {
    if (!id) return;
    if (!isApproved && !comment) {
      alert(t('adminNurseDetail.rejectReasonAlert'));
      return;
    }

    setReviewing(true);
    try {
      await adminApi.reviewNurse(Number(id), { isApproved, comment });
      alert(isApproved ? t('adminNurseDetail.approvalSuccess') : t('adminNurseDetail.rejectionSuccess'));
      navigate('/admin/pending-nurses');
    } catch (err) {
      setError(t('adminNurseDetail.reviewError'));
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

  const handleOcr = async (doc: DocumentDto) => {
    setOcrLoadingId(doc.id);
    setError('');
    try {
      const result = await adminApi.ocrNurseDocument(doc.id);
      setOcrResults((current) => ({ ...current, [doc.id]: result }));
      if (id) {
        setOcrLogs(await adminApi.getOcrLogs(Number(id)));
      }
    } catch (err) {
      setError(getErrorMessage(err, t('adminNurseDetail.ocrError')));
      console.error(err);
    } finally {
      setOcrLoadingId(null);
    }
  };

  const handleDocumentStatus = async (doc: DocumentDto, status: 'approved' | 'rejected') => {
    if (!id) return;

    const reason = status === 'rejected'
      ? window.prompt(t('adminNurseDetail.docRejectPrompt'), t('adminNurseDetail.docRejectDefault'))?.trim()
      : '';

    if (status === 'rejected' && !reason) return;

    setDocActionId(doc.id);
    setError('');
    try {
      if (status === 'approved') {
        await adminApi.approveNurseDocument(Number(id), doc.id);
      } else {
        await adminApi.rejectNurseDocument(Number(id), doc.id, { reason, reasonCode: 'OTHER' });
      }
      await fetchNurseDetails();
    } catch (err) {
      setError(getErrorMessage(err, t('adminNurseDetail.docStatusError')));
      console.error(err);
    } finally {
      setDocActionId(null);
    }
  };

  if (loading) return <div className="admin-loading">{t('adminNurseDetail.loading')}</div>;
  if (!nurse) return <div className="admin-error">{t('adminNurseDetail.notFound')}</div>;

  return (
    <div className="admin-detail-container">
      <button className="back-btn" onClick={() => navigate('/admin/pending-nurses')}>
        <ChevronLeftIcon /> Quay lại danh sách
      </button>

      <header className="detail-header">
        <div className="header-main">
          <h1>Chi tiết hồ sơ: {nurse.fullName}</h1>
          <div className="header-meta">
            <span className="badge-id">ID: {nurse.userId}</span>
            <span className={`badge-status ${nurse.isVerified}`}>{nurse.isVerified}</span>
          </div>
        </div>
      </header>

      <div className="detail-grid">
        <div className="detail-col">
          <section className="detail-section card">
            <h2>Thông tin cá nhân</h2>
            <div className="info-list">
              <div className="info-item"><span className="label">Họ và tên</span><span className="value">{nurse.fullName}</span></div>
              <div className="info-item"><span className="label">Email</span><span className="value">{nurse.email}</span></div>
              <div className="info-item"><span className="label">Số điện thoại</span><span className="value">{nurse.phone}</span></div>
              <div className="info-item"><span className="label">Số năm kinh nghiệm</span><span className="value">{nurse.yearsExperience} năm</span></div>
              <div className="info-item"><span className="label">Bán kính phục vụ</span><span className="value">{nurse.serviceRadiusKm} km</span></div>
            </div>
          </section>

          <section className="detail-section card">
            <h2>Giới thiệu bản thân</h2>
            <div className="bio-box">{nurse.bio || 'Chưa có thông tin giới thiệu.'}</div>
          </section>
        </div>

        <div className="detail-col">
          <section className="detail-section card">
            <h2>Tài liệu đính kèm ({nurse.documents?.length || 0})</h2>
            <div className="doc-list-admin">
              {nurse.documents && nurse.documents.length > 0 ? nurse.documents.map((doc) => (
                <div key={doc.id} className="doc-admin-item">
                  <div className="doc-preview" onClick={() => setPreviewDoc(doc)}>
                    <img src={doc.fileUrl} alt={doc.type} loading="lazy" />
                  </div>
                  <div className="doc-details">
                    <span className="doc-type">{doc.type.replace(/_/g, ' ').toUpperCase()}</span>
                    <div className="doc-actions-inline">
                      <button className="view-btn" onClick={() => setPreviewDoc(doc)}>Xem chi tiết ảnh</button>
                      {isIdCardDocument(doc.type) && (
                        <button
                          className="ocr-btn"
                          onClick={() => void handleOcr(doc)}
                          disabled={ocrLoadingId === doc.id}
                        >
                          {ocrLoadingId === doc.id ? 'Đang OCR...' : 'OCR CCCD'}
                        </button>
                      )}
                      <button
                        className="doc-approve-btn"
                        onClick={() => void handleDocumentStatus(doc, 'approved')}
                        disabled={docActionId === doc.id}
                      >
                        Duyệt tài liệu
                      </button>
                      <button
                        className="doc-reject-btn"
                        onClick={() => void handleDocumentStatus(doc, 'rejected')}
                        disabled={docActionId === doc.id}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                  <span className={`doc-status-tag ${doc.status}`}>{doc.status}</span>
                  {ocrLogs.find((log) => log.nurseDocumentId === doc.id) && (
                    <div className="ocr-log-chip">
                      OCR {ocrLogs.find((log) => log.nurseDocumentId === doc.id)?.ocrStatus}
                      <span>
                        Lần {ocrLogs.find((log) => log.nurseDocumentId === doc.id)?.attemptCount}
                      </span>
                    </div>
                  )}
                  {ocrResults[doc.id] && (
                    <div className="ocr-result-box">
                      <div className="ocr-result-head">
                        <span>FPT AI OCR</span>
                        <strong>Độ tin cậy {ocrResults[doc.id].confidenceScore}%</strong>
                      </div>
                      {ocrResults[doc.id].warning && (
                        <div className="ocr-warning">{ocrResults[doc.id].warning}</div>
                      )}
                      <div className="ocr-field-grid">
                        {ocrFields
                          .map((field) => ({ ...field, value: ocrResults[doc.id][field.key] }))
                          .filter((field) => typeof field.value === 'string' && field.value.trim())
                          .map((field) => (
                            <div key={field.key} className="ocr-field">
                              <span>{field.label}</span>
                              <strong>{field.value}</strong>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )) : <p className="no-docs">Không có tài liệu nào được cung cấp.</p>}
            </div>
          </section>

          <section className="detail-section review-card">
            <h2>Quyết định phê duyệt</h2>
            {nurse.rejectionReason && (
              <div className="bio-box" style={{ marginBottom: '12px' }}>
                <strong>Lý do từ chối gần nhất:</strong> {nurse.rejectionReason}
              </div>
            )}
            <div className="review-form">
              <label>Nhận xét / Lý do (nếu từ chối)</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhập nhận xét của bạn về hồ sơ này..." rows={4} />
              <div className="review-actions">
                <button className="btn-reject" onClick={() => handleReview(false)} disabled={reviewing}><XIcon /> Từ chối hồ sơ</button>
                <button className="btn-approve" onClick={() => handleReview(true)} disabled={reviewing}><CheckIcon /> Phê duyệt ngay</button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {previewDoc && (
        <div className="doc-modal" onClick={() => setPreviewDoc(null)}>
          <div className="doc-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewDoc.fileUrl} alt={previewDoc.type} />
            <div className="doc-modal-actions">
              <a href={previewDoc.fileUrl} target="_blank" rel="noreferrer">Mở tab mới</a>
              <button onClick={() => setPreviewDoc(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="admin-error-banner">{error}</div>}
    </div>
  );
};

export default AdminNurseDetail;
