import './AdminUsers.css';

const AdminUsers = () => {
    return (
        <div className="admin-page-container">
            <header className="page-header">
                <h1>User Management</h1>
                <p>Manage all registered parents and nurses on the platform.</p>
            </header>

            <div className="placeholder-content card">
                <div className="placeholder-icon">👥</div>
                <h3>User list coming soon</h3>
                <p>We are integrating the user management API to allow you to search, filter, and manage accounts.</p>
            </div>
        </div>
    );
};

export default AdminUsers;
