import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import type { NurseProfileDetailDto } from '../../types/nurse';
import { UserIcon as UserOutlineIcon } from '@heroicons/react/24/outline';

const NurseVerification = () => {
    const [nurses, setNurses] = useState<NurseProfileDetailDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNurses = async () => {
            try {
                const data = await adminApi.getPendingNurses();
                setNurses(data.slice(0, 5)); // Only show top 5 on dashboard
            } catch (error) {
                console.error('Failed to fetch pending nurses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNurses();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 p-6 flex items-center justify-center h-full">
                <span className="text-gray-400 text-sm">Loading requests...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Nurse Verification</h3>
                <span className="bg-blue-100 text-[#4F8CFF] text-xs font-bold px-2 py-1 rounded-full">{nurses.length} new</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {nurses.length > 0 ? (
                    nurses.map((nurse) => (
                        <Link
                            key={nurse.userId}
                            to={`/admin/nurses/${nurse.userId}`}
                            className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 overflow-hidden">
                                <UserOutlineIcon className="w-6 h-6 text-[#4F8CFF]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#4F8CFF] transition-colors">
                                        {nurse.fullName}
                                    </h4>
                                </div>
                                <p className="text-xs text-gray-500 mb-2 truncate">
                                    {nurse.yearsExperience} years experience
                                </p>

                                <span className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                    Review Needed
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-sm text-gray-400">No pending requests</p>
                    </div>
                )}
            </div>

            <Link
                to="/admin/pending-nurses"
                className="w-full mt-4 py-2 text-center text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
                View All Requests
            </Link>
        </div>
    );
};

export default NurseVerification;
