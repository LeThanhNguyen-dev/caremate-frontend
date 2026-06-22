import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import caremateApi from '../api/caremateApi';
import { useTranslation } from 'react-i18next';

const pendingBookingStorageKey = 'caremate_pending_booking';

const PaymentResultPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const code = searchParams.get('code');
  const orderCode = searchParams.get('orderCode');
  const isSuccessRoute = location.pathname.endsWith('/payment/success');
  const isCancelRoute = location.pathname.endsWith('/payment/cancel');
  const isSuccess = isSuccessRoute && (status === 'PAID' || code === '00');
  const { t } = useTranslation();
  const [finalizing, setFinalizing] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSuccessRoute) {
        setTitle(t('payment.successTitle'));
    } else if (isCancelRoute) {
        setTitle(t('payment.cancelTitle'));
    } else {
        setTitle(t('payment.processingTitle'));
    }
  }, [isSuccessRoute, isCancelRoute, t]);

  useEffect(() => {
    const finalizeBooking = async () => {
      if (isCancelRoute) {
        localStorage.removeItem(pendingBookingStorageKey);
        setMessage(t('payment.cancelDesc'));
        return;
      }

      if (!isSuccess) {
        setMessage(t('payment.processingDesc'));
        return;
      }

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
        setMessage(t('payment.successDesc'));
      } catch {
        setMessage(t('payment.errorDesc'));
      } finally {
        setFinalizing(false);
      }
    };

    void finalizeBooking();
  }, [isCancelRoute, isSuccess, orderCode, t]);

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

        <h1 className="text-3xl font-black text-[#10233F]">{title}</h1>

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
            <Link to="/my-bookings" className="btn-primary flex justify-center w-full max-w-xs mx-auto">
                {t('payment.myBookings')}
            </Link>
            <Link to="/" className="btn-secondary flex justify-center w-full max-w-xs mx-auto mt-4">
                {t('payment.backHome')}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
