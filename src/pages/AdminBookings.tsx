import './AdminUsers.css'; // Reusing the same styling

const AdminBookings = () => {
    return (
        <div className="admin-page-container">
            <header className="page-header">
                <h1>Service Bookings</h1>
                <p>Track and manage all nurse care appointments.</p>
            </header>

            <div className="placeholder-content card">
                <div className="placeholder-icon">📅</div>
                <h3>Bookings overview coming soon</h3>
                <p>We are integrating the bookings API to show all active, pending, and completed appointments.</p>
            </div>
        </div>
    );
};

export default AdminBookings;
