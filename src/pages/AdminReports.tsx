import './AdminUsers.css'; // Reusing the same styling

const AdminReports = () => {
    return (
        <div className="admin-page-container">
            <header className="page-header">
                <h1>Financial Reports</h1>
                <p>Platform revenue and growth analytics.</p>
            </header>

            <div className="placeholder-content card">
                <div className="placeholder-icon">📊</div>
                <h3>Reports and charts coming soon</h3>
                <p>Detailed financial breakdowns and performance metrics will be available once the analytics API is connected.</p>
            </div>
        </div>
    );
};

export default AdminReports;
