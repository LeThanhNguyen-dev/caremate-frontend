import './AdminUsers.css'; // Reusing the same styling

const AdminSettings = () => {
    return (
        <div className="admin-page-container">
            <header className="page-header">
                <h1>System Settings</h1>
                <p>Configure platform rules and administrative preferences.</p>
            </header>

            <div className="placeholder-content card">
                <div className="placeholder-icon">⚙️</div>
                <h3>Settings coming soon</h3>
                <p>Administrative configuration options will be available here.</p>
            </div>
        </div>
    );
};

export default AdminSettings;
