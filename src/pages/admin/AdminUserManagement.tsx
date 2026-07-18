import { useState, useEffect } from 'react';
import { 
    getUserDirectory, 
    banUser, 
    unbanUser, 
    deleteUser,
    bulkDeleteUsers,
    getUserProfile,
    changeSubscription,
    addCredits,
    deductCredits,
    type UserIntelligence,
    type AdminUserProfile,
    type PaginatedResponse
} from '../../api/admin';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { 
    Search, 
    Ban, 
    CheckCircle, 
    Trash2, 
    Eye, 
    CreditCard, 
    Crown,
    X,
    Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminUserManagement() {
    const [users, setUsers] = useState<PaginatedResponse<UserIntelligence> | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    
    // Bulk selection state
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Confirm modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    } | null>(null);

    // Credit modal state
    const [creditAction, setCreditAction] = useState<'add' | 'deduct'>('add');
    const [creditAmount, setCreditAmount] = useState('');
    const [creditType, setCreditType] = useState<'MONTHLY' | 'BONUS'>('BONUS');
    const [creditReason, setCreditReason] = useState('');

    // Subscription modal state
    const [newTier, setNewTier] = useState('');

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, currentPage]);

    useEffect(() => {
        // Reset selection when page changes
        setSelectedUserIds(new Set());
        setSelectAll(false);
    }, [currentPage, searchQuery]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUserDirectory(searchQuery, currentPage, 15);
            setUsers(data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (userId: number) => {
        const newSelection = new Set(selectedUserIds);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUserIds(newSelection);
        setSelectAll(newSelection.size === users?.content.length);
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedUserIds(new Set());
            setSelectAll(false);
        } else {
            const allIds = new Set(users?.content.map(u => u.userId) || []);
            setSelectedUserIds(allIds);
            setSelectAll(true);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUserIds.size === 0) {
            toast.error('No users selected');
            return;
        }

        setConfirmAction({
            title: 'Bulk Delete Users',
            message: `Are you sure you want to DELETE ${selectedUserIds.size} user(s)? This action cannot be undone and all user data will be permanently removed!`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    const result = await bulkDeleteUsers(Array.from(selectedUserIds));
                    toast.success(`Successfully deleted ${result.successfullyDeleted} out of ${result.totalRequested} users`);
                    setSelectedUserIds(new Set());
                    setSelectAll(false);
                    loadUsers();
                    setShowConfirmModal(false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to delete users');
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleBanUser = async (userId: number) => {
        setConfirmAction({
            title: 'Ban User',
            message: 'Are you sure you want to ban this user? They will no longer be able to access the platform.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await banUser(userId);
                    toast.success('User banned successfully');
                    loadUsers();
                    setShowConfirmModal(false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to ban user');
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleUnbanUser = async (userId: number) => {
        try {
            await unbanUser(userId);
            toast.success('User unbanned successfully');
            loadUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to unban user');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        setConfirmAction({
            title: 'Delete User',
            message: 'Are you sure you want to DELETE this user? This action cannot be undone and all user data will be permanently removed!',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await deleteUser(userId);
                    toast.success('User deleted successfully');
                    loadUsers();
                    setShowConfirmModal(false);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to delete user');
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleViewProfile = async (userId: number) => {
        try {
            const profile = await getUserProfile(userId);
            setSelectedUser(profile);
            setShowProfileModal(true);
        } catch {
            toast.error('Failed to load user profile');
        }
    };

    const handleCreditAdjustment = async () => {
        if (!selectedUser || !creditAmount || !creditReason) {
            toast.error('Please fill all fields');
            return;
        }

        try {
            const request = {
                amount: parseFloat(creditAmount),
                creditType,
                reason: creditReason
            };

            if (creditAction === 'add') {
                await addCredits(selectedUser.id, request);
                toast.success('Credits added successfully');
            } else {
                await deductCredits(selectedUser.id, request);
                toast.success('Credits deducted successfully');
            }

            setShowCreditModal(false);
            setCreditAmount('');
            setCreditReason('');
            loadUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to adjust credits');
        }
    };

    const handleSubscriptionChange = async () => {
        if (!selectedUser || !newTier) {
            toast.error('Please select a subscription tier');
            return;
        }

        try {
            await changeSubscription(selectedUser.id, { subscriptionTier: newTier });
            toast.success('Subscription updated successfully');
            setShowSubscriptionModal(false);
            setNewTier('');
            loadUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update subscription');
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-[1600px] mx-auto p-8 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            <Users className="text-purple-400" size={48} />
                            DIRECTORY
                        </h1>
                        <p className="text-white/30 text-sm mt-2 uppercase tracking-[0.3em] font-bold">
                            User Intelligence & Control Plane
                        </p>
                    </div>
                </div>

            {/* Search Bar */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={24} />
                    <input
                        type="text"
                        placeholder="Scan directory by name, email or ID..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="w-full pl-16 pr-8 py-6 border border-white/5 rounded-[2.5rem] bg-[#0f172a]/50 backdrop-blur-xl text-white text-xl font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all placeholder:text-white/10 outline-none"
                    />
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedUserIds.size > 0 && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-blue-600" size={20} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedUserIds.size} user(s) selected
                        </span>
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Trash2 size={18} />
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-6 text-left w-16">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 bg-[#0f172a] border-white/10 rounded-lg text-purple-600 focus:ring-offset-0 focus:ring-purple-500/50"
                                    />
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-black text-white/30 uppercase tracking-[0.2em]">
                                    Identity
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-black text-white/30 uppercase tracking-[0.2em]">
                                    Usage Metrics
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-black text-white/30 uppercase tracking-[0.2em]">
                                    Status
                                </th>
                                <th className="px-8 py-6 text-right text-xs font-black text-white/30 uppercase tracking-[0.2em]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-white/20">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                                            <span className="font-bold tracking-widest uppercase text-xs">Accessing Records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users?.content.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-white/20 font-bold uppercase tracking-widest text-xs">
                                        No matching records found in the directory
                                    </td>
                                </tr>
                            ) : (
                                users?.content.map((user) => (
                                    <tr key={user.userId} className="hover:bg-white/[0.02] transition-colors group/row">
                                        <td className="px-8 py-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.has(user.userId)}
                                                onChange={() => toggleUserSelection(user.userId)}
                                                className="w-5 h-5 bg-[#0f172a] border-white/10 rounded-lg text-purple-600 focus:ring-offset-0 focus:ring-purple-500/50 transition-all"
                                            />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-white group-hover/row:text-purple-400 transition-colors">
                                                    {user.fullName || 'Anonymous'}
                                                </span>
                                                <span className="text-sm text-white/30 font-medium">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white/20 uppercase tracking-tighter">Tokens</span>
                                                    <span className="text-sm font-bold text-blue-400">
                                                        {user.totalTokens?.toLocaleString() || '0'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col border-l border-white/5 pl-6">
                                                    <span className="text-xs font-black text-white/20 uppercase tracking-tighter">Sessions</span>
                                                    <span className="text-sm font-bold text-indigo-400">
                                                        {user.loginCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    user.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    user.isActive ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    {user.isActive ? 'ACTIVE' : 'BANNED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleViewProfile(user.userId)}
                                                    className="p-3 bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/10 border border-white/5 rounded-xl transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleViewProfile(user.userId).then(() => {
                                                            setShowCreditModal(true);
                                                        });
                                                    }}
                                                    className="p-3 bg-white/[0.03] text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5 rounded-xl transition-all"
                                                    title="Manage Credits"
                                                >
                                                    <CreditCard size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleViewProfile(user.userId).then(() => {
                                                            setShowSubscriptionModal(true);
                                                        });
                                                    }}
                                                    className="p-3 bg-white/[0.03] text-purple-400/60 hover:text-purple-400 hover:bg-purple-500/10 border border-white/5 rounded-xl transition-all"
                                                    title="Change Subscription"
                                                >
                                                    <Crown size={18} />
                                                </button>
                                                <button
                                                    onClick={() => user.isActive ? handleBanUser(user.userId) : handleUnbanUser(user.userId)}
                                                    className={cn(
                                                        "p-3 bg-white/[0.03] border border-white/5 rounded-xl transition-all",
                                                        user.isActive 
                                                            ? "text-orange-400/60 hover:text-orange-400 hover:bg-orange-500/10" 
                                                            : "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                    )}
                                                    title={user.isActive ? "Ban User" : "Unban User"}
                                                >
                                                    {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.userId)}
                                                    className="p-3 bg-white/[0.03] text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 rounded-xl transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users && users.totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing page {currentPage + 1} of {users.totalPages}
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
                                onClick={() => setCurrentPage(p => Math.min(users.totalPages - 1, p + 1))}
                                disabled={currentPage >= users.totalPages - 1}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {showProfileModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    User Profile
                                </h2>
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Full Name</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.fullName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                                        <p className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedUser.isActive ? 'Active' : 'Banned'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Subscription</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.subscriptionTier}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Monthly Credits</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.monthlyCredits}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Bonus Credits</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.bonusCredits}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Total Tokens Used</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.totalTokensUsed?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Login Count</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.loginCount}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Fraud Flagged</label>
                                        <p className={`font-medium ${selectedUser.isFraudFlagged ? 'text-red-600' : 'text-green-600'}`}>
                                            {selectedUser.isFraudFlagged ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Registration IP</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{selectedUser.registrationIp || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Adjustment Modal */}
            {showCreditModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Adjust Credits
                            </h2>
                            <button
                                onClick={() => setShowCreditModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Action</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCreditAction('add')}
                                        className={`flex-1 py-2 rounded ${creditAction === 'add' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        Add Credits
                                    </button>
                                    <button
                                        onClick={() => setCreditAction('deduct')}
                                        className={`flex-1 py-2 rounded ${creditAction === 'deduct' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        Deduct Credits
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Credit Type</label>
                                <select
                                    value={creditType}
                                    onChange={(e) => setCreditType(e.target.value as 'MONTHLY' | 'BONUS')}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="MONTHLY">Monthly Credits</option>
                                    <option value="BONUS">Bonus Credits</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Amount</label>
                                <input
                                    type="number"
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Reason</label>
                                <textarea
                                    value={creditReason}
                                    onChange={(e) => setCreditReason(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    rows={3}
                                    placeholder="Enter reason for adjustment"
                                />
                            </div>

                            <button
                                onClick={handleCreditAdjustment}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Change Modal */}
            {showSubscriptionModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Change Subscription
                            </h2>
                            <button
                                onClick={() => setShowSubscriptionModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Tier</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedUser.subscriptionTier}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">New Tier</label>
                                <select
                                    value={newTier}
                                    onChange={(e) => setNewTier(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="">Select tier...</option>
                                    <option value="FREE">FREE</option>
                                    <option value="BASIC">BASIC</option>
                                    <option value="PRO">PRO</option>
                                    <option value="ENTERPRISE">ENTERPRISE</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSubscriptionChange}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Update Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
            </div>
        </PageWrapper>
    );
}
