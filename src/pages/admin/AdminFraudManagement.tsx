import { useState, useEffect } from 'react';
import { 
    getFraudFlaggedUsers, 
    getSuspiciousRegistrations,
    setFraudFlag,
    clearFraudFlag,
    type FraudFlaggedUser,
    type SuspiciousRegistrations,
    type PaginatedResponse
} from '../../api/admin';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AlertTriangle, Flag, CheckCircle, Users, Fingerprint, Globe } from 'lucide-react';

export default function AdminFraudManagement() {
    const [fraudUsers, setFraudUsers] = useState<PaginatedResponse<FraudFlaggedUser> | null>(null);
    const [suspiciousRegs, setSuspiciousRegs] = useState<SuspiciousRegistrations | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'flagged' | 'suspicious'>('flagged');
    
    // Confirm modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    } | null>(null);

    useEffect(() => {
        if (activeTab === 'flagged') {
            loadFraudUsers();
        } else {
            loadSuspiciousRegistrations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, currentPage]);

    const loadFraudUsers = async () => {
        setLoading(true);
        try {
            const data = await getFraudFlaggedUsers(currentPage, 20);
            setFraudUsers(data);
        } catch {
            toast.error('Failed to load fraud-flagged users');
        } finally {
            setLoading(false);
        }
    };

    const loadSuspiciousRegistrations = async () => {
        setLoading(true);
        try {
            const data = await getSuspiciousRegistrations();
            setSuspiciousRegs(data);
        } catch {
            toast.error('Failed to load suspicious registrations');
        } finally {
            setLoading(false);
        }
    };

    const handleSetFraudFlag = async (userId: number) => {
        setConfirmAction({
            title: 'Flag User as Fraudulent',
            message: 'Are you sure you want to flag this user as fraudulent? This will mark them for review.',
            variant: 'warning',
            onConfirm: async () => {
                try {
                    await setFraudFlag(userId);
                    toast.success('User flagged successfully');
                    loadFraudUsers();
                    setShowConfirmModal(false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to flag user');
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleClearFraudFlag = async (userId: number) => {
        try {
            await clearFraudFlag(userId);
            toast.success('Fraud flag cleared successfully');
            loadFraudUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clear flag');
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="text-red-600" size={32} />
                        Fraud Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Monitor and manage suspicious user activity
                    </p>
                </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setActiveTab('flagged');
                            setCurrentPage(0);
                        }}
                        className={`pb-3 px-4 font-medium transition-colors ${
                            activeTab === 'flagged'
                                ? 'border-b-2 border-red-600 text-red-600'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Flag size={18} />
                            Flagged Users
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('suspicious');
                            setCurrentPage(0);
                        }}
                        className={`pb-3 px-4 font-medium transition-colors ${
                            activeTab === 'suspicious'
                                ? 'border-b-2 border-orange-600 text-orange-600'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            Suspicious Registrations
                        </div>
                    </button>
                </div>
            </div>

            {/* Flagged Users Tab */}
            {activeTab === 'flagged' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Subscription
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Registration IP
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : fraudUsers?.content.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                            No fraud-flagged users found
                                        </td>
                                    </tr>
                                ) : (
                                    fraudUsers?.content.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.fullName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.isActive 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                    {user.isActive ? 'Active' : 'Banned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {user.subscriptionTier}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.registrationIp || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleClearFraudFlag(user.id)}
                                                    className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                                >
                                                    <CheckCircle size={16} />
                                                    Clear Flag
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {fraudUsers && fraudUsers.totalPages > 1 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Showing page {currentPage + 1} of {fraudUsers.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(fraudUsers.totalPages - 1, p + 1))}
                                    disabled={currentPage >= fraudUsers.totalPages - 1}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Suspicious Registrations Tab */}
            {activeTab === 'suspicious' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500">
                            Loading...
                        </div>
                    ) : !suspiciousRegs ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500">
                            No data available
                        </div>
                    ) : (
                        <>
                            {/* Duplicate IPs */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe className="text-orange-600" size={24} />
                                    Duplicate Registration IPs
                                </h2>
                                {!suspiciousRegs.duplicateIps || suspiciousRegs.duplicateIps.length === 0 ? (
                            <p className="text-gray-500">No duplicate IPs found</p>
                        ) : (
                            <div className="space-y-4">
                                {suspiciousRegs.duplicateIps?.map((group) => (
                                    <div key={group.registrationIp} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    IP: {group.registrationIp}
                                                </span>
                                                <span className="ml-3 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 text-xs font-semibold rounded-full">
                                                    {group.count} accounts
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {group.users?.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.fullName}
                                                        </span>
                                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            onClick={() => handleSetFraudFlag(user.id)}
                                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            Flag
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                            {/* Duplicate Fingerprints */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Fingerprint className="text-purple-600" size={24} />
                                    Duplicate Device Fingerprints
                                </h2>
                                {!suspiciousRegs.duplicateFingerprints || suspiciousRegs.duplicateFingerprints.length === 0 ? (
                            <p className="text-gray-500">No duplicate fingerprints found</p>
                        ) : (
                            <div className="space-y-4">
                                {suspiciousRegs.duplicateFingerprints?.map((group) => (
                                    <div key={group.deviceFingerprint} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    Fingerprint: {group.deviceFingerprint.substring(0, 20)}...
                                                </span>
                                                <span className="ml-3 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 text-xs font-semibold rounded-full">
                                                    {group.count} accounts
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {group.users?.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.fullName}
                                                        </span>
                                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            onClick={() => handleSetFraudFlag(user.id)}
                                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            Flag
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                        </>
                    )}
                </div>
            )}
            </div>

            {/* Confirm Modal */}
            {confirmAction && (
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmAction.onConfirm}
                    title={confirmAction.title}
                    message={confirmAction.message}
                    variant={confirmAction.variant}
                    confirmText="Confirm"
                    cancelText="Cancel"
                />
            )}
        </PageWrapper>
    );
}
