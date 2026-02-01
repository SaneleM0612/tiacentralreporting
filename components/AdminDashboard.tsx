import React, { useState } from 'react';
import { TeamMember, RGMSubmission } from '../types';
import LogoutIcon from './icons/LogoutIcon';
import { sheetsApi } from '../lib/googleSheets';


declare const XLSX: any;

interface AdminDashboardProps {
    user: TeamMember;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [reportType, setReportType] = useState<'RGM' | 'MAU'>('RGM');
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setMessage(null);
        setIsDownloading(true);
        try {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            if (start > end) {
                setMessage({type: 'error', text: "Start date cannot be after end date."});
                setIsDownloading(false);
                return;
            }

            const result = await sheetsApi.getReportData(reportType, start.toISOString(), end.toISOString());

            if (result.error) {
                throw new Error(result.error);
            }
            
            const filteredData = result.data;

            if (!filteredData || filteredData.length === 0) {
                setMessage({type: 'success', text: `No ${reportType} data found for the selected date range.`});
                setIsDownloading(false);
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(filteredData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType} Data`);
            XLSX.writeFile(workbook, `${reportType}_Data_${startDate}_to_${endDate}.xlsx`);

        } catch (error: any) {
            console.error("Failed to download data:", error);
            setMessage({type: 'error', text: `An error occurred: ${error.message}`});
        } finally {
            setIsDownloading(false);
        }
    };

    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:outline-none focus:bg-pink-600 focus:text-white focus:border-transparent bg-white transition-colors duration-200";

    return (
        <div className="min-h-screen bg-pink-50/50">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-pink-600">Reporting Portal - Admin</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 hidden sm:block">
                                Welcome, <span className="font-semibold">{user.fullName}</span>
                            </span>
                            <button onClick={onLogout} className="flex items-center space-x-2 text-gray-600 hover:text-pink-600">
                                <LogoutIcon className="w-6 h-6" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                     {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Download Reports</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                             <div>
                                <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">Report Type</label>
                                <select
                                    id="reportType"
                                    value={reportType}
                                    onChange={e => setReportType(e.target.value as 'RGM' | 'MAU')}
                                    className={inputStyles}
                                >
                                    <option value="RGM">RGM Submissions</option>
                                    <option value="MAU">MAU Submissions</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input 
                                    type="date" 
                                    id="startDate" 
                                    value={startDate} 
                                    onChange={e => setStartDate(e.target.value)}
                                    className={inputStyles}
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                                <input 
                                    type="date" 
                                    id="endDate" 
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className={inputStyles}
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-pink-600 rounded-lg shadow-md hover:bg-pink-700 transition-colors disabled:bg-pink-400"
                            >
                                {isDownloading ? 'Downloading...' : `Download ${reportType} Data`}
                            </button>
                        </div>
                         <p className="text-sm text-gray-500 mt-4">Select the report type and date range to export data as an Excel file.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;