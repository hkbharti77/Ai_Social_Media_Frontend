import { useState, useEffect } from 'react';
import { getAllPayments, getRevenueStats, type PaymentOrder, type RevenueStats, type PaginatedResponse } from '../../api/admin';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import { DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react';

export default function AdminPayments() {
    const [payments, setPayments] = useState<PaginatedResponse<PaymentOrder> | null>(null);
    const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPayments();
        loadRevenueStats();
    }, [statusFilter, currentPage]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const data = await getAllPayments(statusFilter || undefined, currentPage, 20);
            setPayments(data);
        } catch (error) {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const loadRevenueStats = async () => {
        try {
            const stats = await getRevenueStats();
            setRevenueStats(stats);
        } catch (error) {
            toast.error('Failed to load revenue stats');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'FAILED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment & Revenue Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Monitor payments and revenue statistics
                    </p>
                </div>

            {/* Revenue Stats Cards */}
            {revenueStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <DollarSign className="text-green-600" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                            Total Revenue
                        </h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{revenueStats.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {revenueStats.totalPayments} payments
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                            Monthly Revenue
                        </h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{revenueStats.monthlyRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {revenueStats.monthlyPayments} payments
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Calendar className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                            Daily Revenue
                        </h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{revenueStats.dailyRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Today
                        </p>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status:
                    </span>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(0);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Payments</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
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
                            ) : payments?.content.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                payments?.content.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-900 dark:text-white">
                                                {payment.razorpayOrderId.substring(0, 20)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {payment.user?.fullName || 'N/A'}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    {payment.user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {payment.pricingTier?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ₹{payment.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {payments && payments.totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing page {currentPage + 1} of {payments.totalPages}
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
                                onClick={() => setCurrentPage(p => Math.min(payments.totalPages - 1, p + 1))}
                                disabled={currentPage >= payments.totalPages - 1}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </PageWrapper>
    );
}
