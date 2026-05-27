import { Component, type ErrorInfo, type ReactNode } from 'react';

type RenderErrorBoundaryProps = {
  children: ReactNode;
};

type RenderErrorBoundaryState = {
  hasError: boolean;
};

class RenderErrorBoundary extends Component<RenderErrorBoundaryProps, RenderErrorBoundaryState> {
  state: RenderErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-500">Caremate</p>
            <h1 className="mt-4 text-3xl font-black text-[#0B1F3A]">Trang vừa gặp lỗi hiển thị.</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              Tải lại trang để tiếp tục. Nếu lỗi xuất hiện sau khi chọn địa chỉ, hệ thống vẫn sẽ giữ trang thay vì trắng màn hình.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-[#0B1F3A] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RenderErrorBoundary;
