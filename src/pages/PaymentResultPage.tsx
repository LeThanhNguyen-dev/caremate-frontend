import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import caremateApi from '../api/caremateApi';

const pendingBookingStorageKey = 'caremate_pending_booking';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const code = searchParams.get('code');
  const orderCode = searchParams.get('orderCode');
  const isSuccessRoute = location.pathname.endsWith('/payment/success');
  const isCancelRoute = location.pathname.endsWith('/payment/cancel');
  const isSuccess = isSuccessRoute && (status === 'PAID' || code === '00');
  const [finalizing, setFinalizing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(() => {
    if (isSuccess) return 'Thanh toán thành công';
    if (isCancelRoute) return 'Bạn đã hủy thanh toán';
    return 'Thanh toán chưa hoàn tất';
  }, [isCancelRoute, isSuccess]);

  const description = useMemo(() => {
    if (isSuccess) {
      return 'CareMate đang hoàn tất bước tạo booking và ghi nhận thanh toán sau khi payOS báo thành công.';
    }
    if (isCancelRoute) {
      return 'Giao dịch QR đã được hủy. Booking chưa được tạo và bạn có thể quay lại để chọn lịch khác hoặc thanh toán lại.';
    }
    return 'Bạn có thể thử lại thanh toán hoặc quay lại danh sách booking để tiếp tục theo dõi đơn.';
  }, [isCancelRoute, isSuccess]);

  useEffect(() => {
    const finalizeBooking = async () => {
      if (isCancelRoute) {
        localStorage.removeItem(pendingBookingStorageKey);
        setMessage('Bạn đã hủy thanh toán QR nên hệ thống không tạo booking.');
        return;
      }

      if (!isSuccess) return;

      const raw = localStorage.getItem(pendingBookingStorageKey);
      if (!raw) return;

      try {
        setFinalizing(true);
        const payload = JSON.parse(raw) as Record<string, unknown>;
        const booking = await caremateApi.createBooking(payload);

        await caremateApi.payBooking(booking.id, {
          amount: booking.totalPrice,
          method: 'payos',
          status: 'paid',
          transactionId: orderCode ?? `PAYOS-${booking.id}`,
        });

        localStorage.removeItem(pendingBookingStorageKey);
        setMessage('Thanh toán xong, booking đã được tạo và ghi nhận thanh toán thành công.');
      } catch {
        setMessage('Thanh toán đã thành công nhưng hệ thống chưa hoàn tất ghi nhận booking hoặc payment. Vui lòng liên hệ admin để kiểm tra.');
      } finally {
        setFinalizing(false);
      }
    };

    void finalizeBooking();
  }, [isCancelRoute, isSuccess, orderCode]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-100 bg-white p-10 text-center shadow-xl shadow-slate-200/30">
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black ${
            isSuccess ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {isSuccess ? 'OK' : '...'}
        </div>

        <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-4 text-sm font-medium leading-7 text-slate-500">{description}</p>

        {message && (
          <div className="mt-6 rounded-xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
            {message}
          </div>
        )}

        {finalizing && (
          <div className="mt-6 rounded-xl bg-brand/5 px-5 py-4 text-sm font-bold text-slate-600">
            Đang tạo booking và ghi nhận thanh toán...
          </div>
        )}

        {orderCode && (
          <div className="mt-6 rounded-xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
            Mã giao dịch payOS: {orderCode}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => navigate('/my-bookings')} className="btn-primary !rounded-xl !px-8">
            Về đơn đã đặt
          </button>
          {!isSuccess && (
            <Link to="/services" className="btn-secondary !rounded-xl !px-8">
              Xem thêm dịch vụ
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
