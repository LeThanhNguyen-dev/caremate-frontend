import StatCard from '../components/admin/StatCard';
import RecentBookings from '../components/admin/RecentBookings';
import NurseVerification from '../components/admin/NurseVerification';
import GrowthChart from '../components/admin/GrowthChart';
import {
    UserGroupIcon,
    UserIcon,
    ClockIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/solid';

const AdminDashboard = () => {
    return (
        <div className="p-8 space-y-8">
            {/* Operational Overview Section */}
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Operational Overview</h2>
                <p className="text-sm text-gray-500">Real-time performance metrics and onboarding status.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Users"
                    value="12,480"
                    trend="12% vs last month"
                    trendUp={true}
                    icon={UserGroupIcon}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100"
                />
                <StatCard
                    label="Active Nurses"
                    value="842"
                    icon={UserIcon}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100"
                />
                <StatCard
                    label="Pending Appointments"
                    value="156"
                    badgeValue="Urgent"
                    icon={ClockIcon}
                    iconColor="text-orange-600"
                    iconBg="bg-orange-100"
                />
                <StatCard
                    label="Monthly Revenue"
                    value="$45,200"
                    trend="8.5% vs last month"
                    trendUp={true}
                    icon={CurrencyDollarIcon}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-100"
                />
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Table and Chart column */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <RecentBookings />
                    <GrowthChart />
                </div>

                {/* Right Panel column */}
                <div className="col-span-12 lg:col-span-4">
                    <NurseVerification />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
