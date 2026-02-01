import React, { useState, useEffect, useCallback } from 'react';
import { TeamMember, Role, OnboardEntry, OnboardType } from '../types';
import { MAINPLACES_NORTH_WEST, MAINPLACES_NORTHERN_CAPE, MAINPLACES_OFS, ONBOARD_CLUSTERS } from '../constants';
import PlusIcon from './icons/PlusIcon';
import LogoutIcon from './icons/LogoutIcon';
import BackIcon from './icons/BackIcon';
import SendIcon from './icons/SendIcon';
import TrashIcon from './icons/TrashIcon';
import SaveIcon from './icons/SaveIcon';
import { sheetsApi } from '../lib/googleSheets';

interface DashboardProps {
    user: TeamMember;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    // BA-LT now starts at Home view like everyone else, but content differs
    const [view, setView] = useState<'home' | 'submitRGM' | 'submitMAU' | 'onboard' | 'onboardHistory'>('home');
    const [editEntry, setEditEntry] = useState<OnboardEntry | null>(null);

    const handleEditOnboard = (entry: OnboardEntry) => {
        setEditEntry(entry);
        setView('onboard');
    };

    const isBALT = user.role === Role.BA_LT;

    return (
        <div className="min-h-screen bg-pink-50/50">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold text-pink-600">Reporting Portal</h1>
                        </div>
                        <div className="hidden md:block">
                             <span className="text-gray-700">Welcome, <span className="font-semibold">{user.fullName}</span> ({user.role})</span>
                        </div>
                        <button onClick={onLogout} className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors duration-200">
                            <LogoutIcon className="w-6 h-6" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                   <div className="flex flex-col md:flex-row gap-8">
                        <nav className="md:w-1/4 lg:w-1/5">
                            <ul className="space-y-2">
                                <NavItem text="Home" active={view === 'home'} onClick={() => setView('home')} />
                                {!isBALT && (
                                    <>
                                        <NavItem text="Submit RGM" active={view === 'submitRGM'} onClick={() => setView('submitRGM')} />
                                        <NavItem text="Submit MAU" active={view === 'submitMAU'} onClick={() => setView('submitMAU')} variant="purple" />
                                    </>
                                )}
                                <NavItem text="Onboarding" active={view === 'onboard'} onClick={() => { setEditEntry(null); setView('onboard'); }} variant="pink" />
                                <NavItem text="Onboarding History" active={view === 'onboardHistory'} onClick={() => setView('onboardHistory')} variant="pink" />
                            </ul>
                        </nav>
                        <div className="flex-1">
                            {view === 'home' && <HomeView user={user} />}
                            {!isBALT && view === 'submitRGM' && <SubmitDataView user={user} onBackToHome={() => setView('home')} type="RGM" />}
                            {!isBALT && view === 'submitMAU' && <SubmitDataView user={user} onBackToHome={() => setView('home')} type="MAU" />}
                            
                            {view === 'onboard' && <OnboardView user={user} onBack={() => setView('home')} editEntry={editEntry} onSuccess={() => setView('onboardHistory')} />}
                            {view === 'onboardHistory' && <OnboardHistoryView userMsisdn={user.msisdn} onEdit={handleEditOnboard} />}
                        </div>
                   </div>
                </div>
            </main>
        </div>
    );
};

interface NavItemProps {
    text: string;
    active: boolean;
    onClick: () => void;
    variant?: 'pink' | 'purple' | 'teal';
}

const NavItem: React.FC<NavItemProps> = ({ text, active, onClick, variant = 'pink' }) => {
    let activeClass = 'bg-pink-600';
    let hoverClass = 'hover:bg-pink-100 hover:text-pink-700';
    
    if (variant === 'purple') {
        activeClass = 'bg-purple-600';
        hoverClass = 'hover:bg-purple-100 hover:text-purple-700';
    } else if (variant === 'teal') {
        activeClass = 'bg-teal-600';
        hoverClass = 'hover:bg-teal-100 hover:text-teal-700';
    }

    return (
        <li>
            <button
                onClick={onClick}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    active 
                    ? `${activeClass} text-white shadow-lg` 
                    : `bg-white text-gray-700 ${hoverClass}`
                }`}
            >
                {text}
            </button>
        </li>
    );
};

const HomeView: React.FC<{user: TeamMember}> = ({user}) => {
    const [monthlyRGM, setMonthlyRGM] = useState(0);
    const [monthlyMAU, setMonthlyMAU] = useState(0);
    const [monthlyOnboard, setMonthlyOnboard] = useState(0);
    const [monthlyCC, setMonthlyCC] = useState(0);
    const [loading, setLoading] = useState(true);

    const isBALT = user.role === Role.BA_LT;
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

        // Use msisdn as identifier for stats to ensure strict user isolation
        const stats: any = await sheetsApi.getMonthlyStats(user.msisdn, firstDayOfMonth, lastDayOfMonth);
        
        setMonthlyRGM(stats.rgmCount || 0);
        setMonthlyMAU(stats.mauCount || 0);
        setMonthlyOnboard(stats.onboardCount || 0);
        setMonthlyCC(stats.ccCount || 0);
        setLoading(false);
    }, [user.msisdn]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="text-center p-8">Loading dashboard...</div>
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.fullName}!</h2>
                <p className="text-gray-500 mt-2">Here's your monthly summary.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isBALT ? (
                    <>
                        <div className="bg-gradient-to-br from-pink-500 to-pink-700 text-white p-10 rounded-xl shadow-xl text-center flex flex-col justify-center">
                            <p className="text-xl opacity-90 mb-2">Total Criminal Checks ({currentMonth})</p>
                            <p className="text-6xl font-extrabold tracking-tight">{monthlyCC}</p>
                        </div>
                        <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-10 rounded-xl shadow-xl text-center flex flex-col justify-center">
                            <p className="text-xl opacity-90 mb-2">Total Onboards ({currentMonth})</p>
                            <p className="text-6xl font-extrabold tracking-tight">{monthlyOnboard}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-gradient-to-br from-pink-500 to-pink-700 text-white p-10 rounded-xl shadow-xl text-center flex flex-col justify-center">
                            <p className="text-xl opacity-90 mb-2">RGM Submissions ({currentMonth})</p>
                            <p className="text-6xl font-extrabold tracking-tight">{monthlyRGM}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-10 rounded-xl shadow-xl text-center flex flex-col justify-center">
                            <p className="text-xl opacity-90 mb-2">MAU Submissions ({currentMonth})</p>
                            <p className="text-6xl font-extrabold tracking-tight">{monthlyMAU}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

interface SubmissionRow {
    id: number;
    merchantName: string;
    merchantMsisdn: string;
    transactionId: string;
    category: string;
}

interface SubmitDataViewProps {
    user: TeamMember;
    onBackToHome: () => void;
    type: 'RGM' | 'MAU';
}

const SubmitDataView: React.FC<SubmitDataViewProps> = ({user, onBackToHome, type}) => {
    // Initialize with default category for RGM
    const [rows, setRows] = useState<SubmissionRow[]>([{ 
        id: 1, 
        merchantName: '', 
        merchantMsisdn: '', 
        transactionId: '', 
        category: type === 'RGM' ? 'Agent' : ''
    }]);
    
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine entity name based on type (RGM -> Merchant, MAU -> Customer)
    const entityName = type === 'MAU' ? 'Customer' : 'Merchant';

    const addRow = () => {
        setRows([...rows, { 
            id: Date.now(), 
            merchantName: '', 
            merchantMsisdn: '', 
            transactionId: '',
            category: type === 'RGM' ? 'Agent' : ''
        }]);
    };

    const deleteRow = (id: number) => {
        if (rows.length > 1) {
             setRows(rows.filter(row => row.id !== id));
        }
    };
    
    const handleInputChange = (id: number, field: 'merchantMsisdn' | 'transactionId', value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value.replace(/\D/g, '') } : row));
    };
    
    const handleNameInputChange = (id: number, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, merchantName: value } : row));
    };

    const handleCategoryChange = (id: number, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, category: value } : row));
    };

    const handleSubmit = async () => {
        setMessage(null);
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const isRowPartiallyFilled = row.merchantName || row.merchantMsisdn || row.transactionId;
            const isRowFullyFilled = row.merchantName && row.merchantMsisdn && row.transactionId;
            
            if (!isRowPartiallyFilled) continue;

             if (!isRowFullyFilled) {
                setMessage({ type: 'error', text: `Please complete all fields for ${entityName} ${i + 1}.` });
                return;
            }

            if (row.merchantMsisdn.length !== 11) {
                setMessage({ type: 'error', text: `${entityName} MSISDN must be exactly 11 digits. Update ${entityName} ${i + 1}.` });
                return;
            }
            if (row.transactionId.length !== 10) {
                setMessage({ type: 'error', text: `Transaction ID must be exactly 10 digits. Update ${entityName} ${i + 1}.` });
                return;
            }
        }

        const validRows = rows.filter(r => r.merchantName && r.merchantMsisdn && r.transactionId);

        if (validRows.length === 0) {
            setMessage({ type: 'error', text: 'Please fill out at least one complete record.' });
            return;
        }

        // Check for duplicates within the current submission
        const transactionIds = validRows.map(r => r.transactionId);
        
        // Find local duplicates
        const idMap = new Map<string, number[]>();
        rows.forEach((row, index) => {
            const tid = row.transactionId;
            if (tid) {
                if (!idMap.has(tid)) {
                    idMap.set(tid, []);
                }
                idMap.get(tid)?.push(index + 1);
            }
        });

        const localDuplicateMessages: string[] = [];
        idMap.forEach((indices, tid) => {
            if (indices.length > 1) {
                 localDuplicateMessages.push(`Duplicate Transaction IDs found on ${entityName} ${indices.join(' and ')}`);
            }
        });

        if (localDuplicateMessages.length > 0) {
            setMessage({ type: 'error', text: localDuplicateMessages.join('. ') });
            return;
        }

        setIsSubmitting(true);

        const duplicateCheckResult = await sheetsApi.checkTransactionDuplicates(transactionIds, type);

        if (duplicateCheckResult.error) {
             setIsSubmitting(false);
             setMessage({ type: 'error', text: `Error verifying transaction IDs: ${duplicateCheckResult.error}` });
             return;
        }

        if (duplicateCheckResult.duplicates && duplicateCheckResult.duplicates.length > 0) {
             setIsSubmitting(false);
             const duplicateIds = duplicateCheckResult.duplicates;
             const affectedIndices = rows
                .map((row, index) => ({ id: row.transactionId, index: index + 1 }))
                .filter(item => duplicateIds.includes(item.id))
                .map(item => item.index);
             const uniqueAffectedIndices = [...new Set(affectedIndices)].sort((a: number, b: number) => a - b);
             setMessage({ type: 'error', text: `Duplicate Transaction IDs found on ${entityName} ${uniqueAffectedIndices.join(', ')}` });
             return;
        }

        const newSubmissions = validRows.map(row => ({
            team_member_name: user.fullName,
            role: user.role,
            agent_name: row.merchantName,
            agent_msisdn: row.merchantMsisdn,
            transaction_id: row.transactionId,
            submission_date: new Date().toISOString(),
            region: user.region,
            cluster: user.cluster,
            momo_number: user.momoNumber,
            category: type === 'RGM' ? row.category : '',
            team_member_msisdn: user.msisdn // ADDED: Ensure MSISDN is passed for data isolation
        }));
        
        const result = await sheetsApi.submitBatch(newSubmissions, type);
        setIsSubmitting(false);

        if (result.error) {
            setMessage({ type: 'error', text: `Submission failed: ${result.error}` });
            return;
        }

        setRows([{ id: 1, merchantName: '', merchantMsisdn: '', transactionId: '', category: type === 'RGM' ? 'Agent' : '' }]);
        const recordText = newSubmissions.length === 1 ? 'record' : 'records';
        setMessage({ type: 'success', text: `${newSubmissions.length} ${type} ${recordText} submitted successfully!` });
        setTimeout(() => setMessage(null), 3000);
    };

    const inputStyles = `block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-transparent bg-white transition-colors duration-200 ${
        type === 'RGM'
        ? 'focus:bg-pink-600 focus:text-white focus:placeholder-pink-200'
        : 'focus:bg-purple-600 focus:text-white focus:placeholder-purple-200'
    }`;

    return (
    <div className="bg-white rounded-xl shadow-lg animate-fade-in overflow-hidden">
        <div className={`p-6 text-white ${type === 'RGM' ? 'bg-pink-600' : 'bg-purple-600'}`}>
            <button onClick={onBackToHome} className="flex items-center space-x-2 text-sm mb-4 hover:opacity-80 transition-opacity">
                <BackIcon className="w-4 h-4" />
                <span>Back to Home</span>
            </button>
            <h2 className="text-3xl font-bold">Submit {type}</h2>
            <p className="opacity-90 mt-1">Add {entityName.toLowerCase()} transaction details for {type}</p>
        </div>

        <div className="p-6 space-y-6">
            {message && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            
            <div className="space-y-4">
                {rows.map((row, index) => (
                    <div key={row.id} className={`p-6 rounded-lg space-y-4 border ${type === 'RGM' ? 'bg-pink-50/70 border-pink-100' : 'bg-purple-50/70 border-purple-100'}`}>
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">{entityName} {index + 1}</h3>
                             {rows.length > 1 && (
                                <button 
                                    onClick={() => deleteRow(row.id)} 
                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                    title={`Remove ${entityName}`}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        {type === 'RGM' && (
                            <div>
                                <label htmlFor={`category-${row.id}`} className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    id={`category-${row.id}`}
                                    value={row.category}
                                    onChange={e => handleCategoryChange(row.id, e.target.value)}
                                    className={inputStyles}
                                >
                                    <option value="Agent">Agent</option>
                                    <option value="Customer Sub-Wallets">Customer Sub-Wallets</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label htmlFor={`merchantName-${row.id}`} className="block text-sm font-medium text-gray-700 mb-1">{entityName} Name</label>
                            <input 
                                id={`merchantName-${row.id}`} 
                                type="text" 
                                placeholder={`Enter ${entityName.toLowerCase()} name`}
                                value={row.merchantName} 
                                onChange={e => handleNameInputChange(row.id, e.target.value)} 
                                className={inputStyles}
                            />
                        </div>
                        <div>
                            <label htmlFor={`merchantMsisdn-${row.id}`} className="block text-sm font-medium text-gray-700 mb-1">{entityName} MSISDN</label>
                            <input 
                                id={`merchantMsisdn-${row.id}`} 
                                type="tel" 
                                placeholder="Enter 11-digit number" 
                                value={row.merchantMsisdn} 
                                onChange={e => handleInputChange(row.id, 'merchantMsisdn', e.target.value)} 
                                maxLength={11} 
                                className={inputStyles}
                            />
                        </div>
                        <div>
                            <label htmlFor={`transactionId-${row.id}`} className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                            <input 
                                id={`transactionId-${row.id}`} 
                                type="tel" 
                                placeholder="Enter 10-digit ID" 
                                value={row.transactionId} 
                                onChange={e => handleInputChange(row.id, 'transactionId', e.target.value)} 
                                maxLength={10} 
                                className={inputStyles}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4 pt-2">
                <button 
                    onClick={addRow} 
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium bg-white border-2 rounded-lg transition-colors disabled:opacity-50 ${type === 'RGM' ? 'text-pink-600 border-pink-200 hover:bg-pink-50' : 'text-purple-600 border-purple-200 hover:bg-purple-50'}`}
                    disabled={isSubmitting}
                >
                    <PlusIcon className="w-5 h-5"/>
                    <span>Add Another {entityName}</span>
                </button>
                <button 
                    onClick={handleSubmit} 
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-colors disabled:opacity-50 ${type === 'RGM' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                    disabled={isSubmitting}
                >
                    <SendIcon className="w-5 h-5" />
                    <span>{isSubmitting ? 'Submitting...' : `Submit ${rows.length} Record${rows.length !== 1 ? 's' : ''}`}</span>
                </button>
            </div>
        </div>
    </div>
    );
};


// ------------------ NEW ONBOARDING COMPONENTS ------------------

interface OnboardViewProps {
    user: TeamMember;
    onBack: () => void;
    editEntry?: OnboardEntry | null;
    onSuccess: () => void;
}

const OnboardView: React.FC<OnboardViewProps> = ({ user, onBack, editEntry, onSuccess }) => {
    const [formData, setFormData] = useState<OnboardEntry>({
        type: "Criminal Check",
        name: "",
        msisdn: "",
        contactNo: "",
        idNumber: "",
        physicalAddress: "",
        cluster: "",
        areaMentorRtl: "",
        leaderName: user.fullName,
        leaderMsisdn: "",
        onboardedDate: new Date().toISOString().split('T')[0],
        amlScore: 12,
        mainplace: ""
    });

    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editEntry) {
            setFormData(editEntry);
        }
    }, [editEntry]);

    const getMainplaces = () => {
        if (formData.cluster === "North West") return MAINPLACES_NORTH_WEST;
        if (formData.cluster === "Northern Cape") return MAINPLACES_NORTHERN_CAPE;
        if (formData.cluster === "Ofs") return MAINPLACES_OFS;
        return [];
    };

    const isCriminalCheck = formData.type === "Criminal Check";

    const handleSubmit = async () => {
        setMessage(null);
        
        // Validation
        if (!formData.name.trim()) {
             setMessage({ type: 'error', text: "Name is required." });
             return;
        }

        if (isCriminalCheck) {
             if (!formData.idNumber || formData.idNumber.length !== 13) {
                 setMessage({ type: 'error', text: "ID Number must be 13 digits." });
                 return;
             }
        } else {
             // Strict validation for New Upload / Re-Upload
             if (!formData.name || !formData.msisdn || !formData.contactNo || !formData.idNumber || !formData.physicalAddress || !formData.cluster || !formData.areaMentorRtl || !formData.leaderMsisdn || !formData.onboardedDate || !formData.amlScore || !formData.mainplace) {
                 setMessage({ type: 'error', text: "All fields are mandatory for this Type." });
                 return;
             }
             if (formData.msisdn.length !== 11) {
                 setMessage({ type: 'error', text: "MSISDN must be 11 digits." });
                 return;
             }
             if (formData.contactNo.length !== 11) {
                 setMessage({ type: 'error', text: "Contact No must be 11 digits." });
                 return;
             }
             if (formData.idNumber.length !== 13) {
                 setMessage({ type: 'error', text: "ID Number must be 13 digits." });
                 return;
             }
             if (formData.leaderMsisdn.length !== 11) {
                 setMessage({ type: 'error', text: "Leader MSISDN must be 11 digits." });
                 return;
             }
             if (formData.amlScore < 12) {
                 setMessage({ type: 'error', text: "Low AML score redo AML" });
                 return;
             }
             if (formData.amlScore > 15) {
                 setMessage({ type: 'error', text: "AML Score cannot be greater than 15." });
                 return;
             }
        }

        setIsSubmitting(true);

        // CHANNEL LOGIC:
        // If BA-LT -> "BA"
        // If TDR/MDR -> "Spaza"
        // Others (Admin) -> "Spaza" (default logic)
        const channelValue = user.role === Role.BA_LT ? "BA" : "Spaza";
        
        // Attach submitterMsisdn (user.msisdn) to ensure ownership tracking
        const payload = { 
            ...formData, 
            channel: channelValue,
            submitterMsisdn: user.msisdn 
        };

        const result = await sheetsApi.submitOnboard(payload);
        setIsSubmitting(false);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: "Saved successfully!" });
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }
    };

    const inputStyles = "block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-pink-600 focus:text-white focus:placeholder-pink-200 focus:border-transparent bg-white transition-colors duration-200";

    return (
        <div className="bg-white rounded-xl shadow-lg animate-fade-in overflow-hidden">
            <div className="p-6 text-white bg-pink-600">
                <button onClick={onBack} className="flex items-center space-x-2 text-sm mb-4 hover:opacity-80 transition-opacity">
                    <BackIcon className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>
                <h2 className="text-3xl font-bold">{editEntry ? 'Edit Onboard Entry' : 'New Onboard Entry'}</h2>
            </div>
            
            <div className="p-6 space-y-6">
                 {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select 
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value as OnboardType})} 
                            className={inputStyles}
                        >
                            <option value="Criminal Check">Criminal Check</option>
                            <option value="New Upload">New Upload</option>
                            <option value="Re-Upload">Re-Upload</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name {isCriminalCheck && '*'}</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyles} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (13 digits) {isCriminalCheck && '*'}</label>
                        <input type="tel" maxLength={13} value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value.replace(/\D/g,'')})} className={inputStyles} />
                    </div>

                    {!isCriminalCheck && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">MSISDN (11 digits)</label>
                                <input type="tel" maxLength={11} value={formData.msisdn} onChange={e => setFormData({...formData, msisdn: e.target.value.replace(/\D/g,'')})} className={inputStyles} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No (11 digits)</label>
                                <input type="tel" maxLength={11} value={formData.contactNo} onChange={e => setFormData({...formData, contactNo: e.target.value.replace(/\D/g,'')})} className={inputStyles} />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                <input type="text" value={formData.physicalAddress} onChange={e => setFormData({...formData, physicalAddress: e.target.value})} className={inputStyles} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
                                <select value={formData.cluster} onChange={e => setFormData({...formData, cluster: e.target.value})} className={inputStyles}>
                                    <option value="" disabled>Select Cluster</option>
                                    {ONBOARD_CLUSTERS.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mainplace</label>
                                <select value={formData.mainplace} onChange={e => setFormData({...formData, mainplace: e.target.value})} className={inputStyles} disabled={!formData.cluster}>
                                    <option value="" disabled>Select Mainplace</option>
                                    {getMainplaces().map(p => <option key={p} value={p} className="text-black">{p}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Areas Mentor/RTL</label>
                                <input type="text" value={formData.areaMentorRtl} onChange={e => setFormData({...formData, areaMentorRtl: e.target.value})} className={inputStyles} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">TDR/MDR/Leader (Read Only)</label>
                                <input type="text" value={formData.leaderName} disabled className={`${inputStyles} bg-gray-100 opacity-70`} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Leader MSISDN (11 digits)</label>
                                <input type="tel" maxLength={11} value={formData.leaderMsisdn} onChange={e => setFormData({...formData, leaderMsisdn: e.target.value.replace(/\D/g,'')})} className={inputStyles} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Onboarded Date</label>
                                <input type="date" value={formData.onboardedDate} onChange={e => setFormData({...formData, onboardedDate: e.target.value})} className={inputStyles} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">AML Score (12-15)</label>
                                <input type="number" min="0" max="15" value={formData.amlScore} onChange={e => setFormData({...formData, amlScore: parseInt(e.target.value) || 0})} className={inputStyles} />
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-4">
                     <button 
                        onClick={handleSubmit} 
                        className="w-full flex items-center justify-center space-x-2 px-6 py-3 font-semibold text-white bg-pink-600 rounded-lg shadow-md hover:bg-pink-700 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        <SaveIcon className="w-5 h-5" />
                        <span>{isSubmitting ? 'Saving...' : 'Submit Entry'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

interface OnboardHistoryViewProps {
    onEdit: (entry: OnboardEntry) => void;
    userMsisdn: string;
}

const OnboardHistoryView: React.FC<OnboardHistoryViewProps> = ({ onEdit, userMsisdn }) => {
    const [activeTab, setActiveTab] = useState<'CC' | 'Regular'>('Regular');
    const [data, setData] = useState<OnboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        // Pass userMsisdn to getOnboards to enforce filtering server-side
        const result = await sheetsApi.getOnboards(activeTab, userMsisdn);
        if (result.error) {
             setError(result.error);
             setData([]);
        } else if (result.data) {
            // Client-side sort fallback: Latest date on top
            const sorted = result.data.sort((a: any, b: any) => {
                const da = new Date(a.created_at).getTime();
                const db = new Date(b.created_at).getTime();
                return db - da; // Descending
            });
            setData(sorted);
        } else {
             setData([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (userMsisdn) {
            fetchData();
        }
    }, [activeTab, userMsisdn]);

    return (
        <div className="bg-white rounded-xl shadow-lg animate-fade-in overflow-hidden">
             <div className="p-6 bg-pink-600 text-white flex flex-col md:flex-row justify-between items-center">
                <h2 className="text-2xl font-bold mb-4 md:mb-0">Onboarding History</h2>
                <div className="flex space-x-2 bg-pink-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('Regular')}
                        className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'Regular' ? 'bg-white text-pink-800 font-bold shadow' : 'text-pink-100 hover:text-white'}`}
                    >
                        Onboards
                    </button>
                    <button 
                         onClick={() => setActiveTab('CC')}
                        className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'CC' ? 'bg-white text-pink-800 font-bold shadow' : 'text-pink-100 hover:text-white'}`}
                    >
                        Onboard CC
                    </button>
                </div>
            </div>

            <div className="p-0 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading data...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 bg-red-50">
                        <p className="font-bold">Error loading records:</p>
                        <p>{error}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No records found.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                {activeTab === 'CC' ? (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                                ) : (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MSISDN</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cluster</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button 
                                            onClick={() => onEdit(row)}
                                            className="text-pink-600 hover:text-pink-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                                    {activeTab === 'CC' ? (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.idNumber}</td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.msisdn}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.cluster}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.onboardedDate}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;