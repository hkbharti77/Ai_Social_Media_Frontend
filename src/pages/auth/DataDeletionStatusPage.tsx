import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

interface DeletionStatus {
  confirmationCode: string;
  status: string;
  requestedAt: string;
}

export default function DataDeletionStatusPage() {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<DeletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await axios.get(`${apiUrl}/api/v1/social/facebook/deletion-status/${code}`);
        setStatus(response.data);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError('Confirmation code not found. The request might have expired or the code is invalid.');
        } else {
          setError('An error occurred while fetching the status. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchStatus();
    } else {
      setError('No confirmation code provided.');
      setLoading(false);
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Data Deletion Status
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tracking your Facebook data deletion request
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-500">Retrieving your request status...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error retrieving status</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : status ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2">
                  Request Details
                </h3>
                <dl className="mt-4 space-y-4">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Confirmation Code</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border">{status.confirmationCode}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        status.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status.status}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Requested Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(status.requestedAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="pt-4 text-sm text-gray-500 border-t">
                Your data has been permanently removed from our active systems as per your request via Facebook.
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
