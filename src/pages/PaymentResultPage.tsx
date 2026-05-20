import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import caremateApi from '../api/caremateApi';

const pendingBookingStorageKey = 'caremate_pending_booking';

const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const code = searchParams.get('code');
  const orderCode = searchParams.get('orderCode');
  const isSuccess = status === 'PAID' || code === '00';
  const [finalizing, setFinalizing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const finalizeBooking = async () => {
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
  }, [isSuccess, orderCode]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-slate-100 bg-white p-10 text-center shadow-xl shadow-slate-200/30">
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black ${isSuccess ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
          {isSuccess ? 'OK' : '...'}
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          {isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'}
        </h1>
        <p className="mt-4 text-sm font-medium leading-7 text-slate-500">
          {isSuccess
            ? 'CareMate đang hoàn tất bước tạo booking và ghi nhận thanh toán sau khi payOS báo thành công.'
            : 'Bạn có thể thử lại thanh toán hoặc quay lại danh sách booking để tiếp tục theo dõi đơn.'}
        </p>
        {message && (
          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
            {message}
          </div>
        )}
        {finalizing && (
          <div className="mt-6 rounded-2xl bg-brand/5 px-5 py-4 text-sm font-bold text-slate-600">
            Đang tạo booking và ghi nhận thanh toán...
          </div>
        )}
        {orderCode && (
          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-600">
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
