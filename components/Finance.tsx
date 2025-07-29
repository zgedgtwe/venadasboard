
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, FinancialPocket, PocketType, Profile, Project, ProjectStatus } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { PencilIcon, Trash2Icon, PlusIcon, PiggyBankIcon, LockIcon, Users2Icon, ClipboardListIcon, TagIcon, TrendingUpIcon, UsersIcon as UsersIconSm, ChevronRightIcon } from '../constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const emptyTransaction: Omit<Transaction, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: TransactionType.EXPENSE,
    category: '',
    method: 'Transfer Bank',
    pocketId: undefined,
    projectId: undefined,
};

const emptyPocket: Omit<FinancialPocket, 'id'> = {
    name: '',
    description: '',
    amount: 0,
    type: PocketType.SAVING,
    icon: 'piggy-bank'
};

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

const CHART_COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#eab308', '#ef4444', '#64748b'];

const LineChart: React.FC<{ data: { date: string; income: number; expense: number }[] }> = ({ data }) => {
    const width = 500;
    const height = 250;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };

    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

    const xScale = (index: number) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value: number) => height - padding.bottom - (value / maxVal) * (height - padding.top - padding.bottom);

    const incomePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.income)}`).join(' ');
    const expensePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.expense)}`).join(' ');

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = maxVal * (i / 4);
        return { value: formatCurrency(value).replace(',00',''), y: yScale(value) };
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-axis grid lines and labels */}
            {yAxisLabels.map(({ value, y }, i) => (
                <g key={i}>
                    <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray="2,2" />
                    <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">{value}</text>
                </g>
            ))}
            
            {/* X-axis labels */}
            {data.length > 1 && (
                <>
                <text x={xScale(0)} y={height - padding.bottom + 15} textAnchor="start" fontSize="10" fill="#6b7280">
                    {new Date(data[0].date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </text>
                <text x={xScale(data.length - 1)} y={height - padding.bottom + 15} textAnchor="end" fontSize="10" fill="#6b7280">
                    {new Date(data[data.length - 1].date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </text>
                </>
            )}

            {/* Paths */}
            <path d={incomePath} fill="none" stroke="#10b981" strokeWidth="2" />
            <path d={expensePath} fill="none" stroke="#ef4444" strokeWidth="2" />

            {/* Points and Tooltips */}
            {data.map((d, i) => (
                <g key={i}>
                    <circle cx={xScale(i)} cy={yScale(d.income)} r="3" fill="#10b981" className="cursor-pointer" />
                    <circle cx={xScale(i)} cy={yScale(d.expense)} r="3" fill="#ef4444" className="cursor-pointer" />
                </g>
            ))}
        </svg>
    );
};


const DonutChart: React.FC<{ data: { label: string; value: number }[], title: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="text-center text-slate-500 py-8">Tidak ada data {title.toLowerCase()}.</div>;
    }

    const sortedData = [...data].sort((a,b) => b.value - a.value);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
             <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9154943092" fill="#fff"/>
                        {(() => {
                            let accumulatedPercentage = 0;
                            return sortedData.map((item, index) => {
                                const percentage = (item.value / total) * 100;
                                const element = (
                                    <circle
                                        key={index}
                                        cx="18" cy="18" r="15.9154943092"
                                        fill="transparent"
                                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                        strokeWidth="3.8"
                                        strokeDasharray={`${percentage} ${100 - percentage}`}
                                        strokeDashoffset={-accumulatedPercentage}
                                        transform="rotate(-90 18 18)"
                                    />
                                );
                                accumulatedPercentage += percentage;
                                return element;
                            });
                        })()}
                    </svg>
                </div>
                <div className="w-full md:w-auto text-sm">
                    <ul className="space-y-2">
                        {sortedData.slice(0, 5).map((item, index) => (
                            <li key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                                    <span className="truncate max-w-[100px]">{item.label}</span>
                                </div>
                                <span className="font-semibold">{((item.value / total) * 100).toFixed(0)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const MiniCashFlowChart: React.FC<{income: number, expense: number}> = ({income, expense}) => {
    const maxVal = Math.max(income, expense, 1); // Avoid division by zero
    const incomeHeight = (income / maxVal) * 100;
    const expenseHeight = (expense / maxVal) * 100;
    
    return (
        <div className="flex items-end h-20 gap-2">
            <div className="flex flex-col items-center flex-1">
                <div className="w-8 bg-emerald-200 rounded-t-md" style={{height: `${incomeHeight}%`}} title={`Pemasukan: ${formatCurrency(income)}`}></div>
                <p className="text-xs text-slate-500 mt-1">Pemasukan</p>
            </div>
            <div className="flex flex-col items-center flex-1">
                <div className="w-8 bg-red-200 rounded-t-md" style={{height: `${expenseHeight}%`}} title={`Pengeluaran: ${formatCurrency(expense)}`}></div>
                <p className="text-xs text-slate-500 mt-1">Pengeluaran</p>
            </div>
        </div>
    )
}


interface FinanceProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    projects: Project[];
    profile: Profile;
}

interface ReportVisuals {
    incomeSources: { label: string, value: number }[];
    expenseCategories: { label: string, value: number }[];
    profitableProjects: { name: string, profit: number }[];
}

const getInitialDateRange = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29); // Last 30 days including today
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
    };
};

const Finance: React.FC<FinanceProps> = ({ transactions, setTransactions, pockets, setPockets, projects, profile }) => {
    // Main state
    const [activeTab, setActiveTab] = useState<'transactions' | 'pockets' | 'reports'>('transactions');
    
    // Transaction State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionModalMode, setTransactionModalMode] = useState<'add' | 'edit'>('add');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionFormData, setTransactionFormData] = useState<Omit<Transaction, 'id'>>(emptyTransaction);
    const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', type: 'all' as 'all' | TransactionType, search: '' });
    const [activeExpenseCategory, setActiveExpenseCategory] = useState<string>('all');
    const [activeIncomeCategory, setActiveIncomeCategory] = useState<string>('all');


    // Pocket State
    const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
    const [pocketModalMode, setPocketModalMode] = useState<'add' | 'edit' | 'manage'>('add');
    const [selectedPocket, setSelectedPocket] = useState<FinancialPocket | null>(null);
    const [pocketFormData, setPocketFormData] = useState<Omit<FinancialPocket, 'id'>>(emptyPocket);
    const [manageAmount, setManageAmount] = useState<number | ''>('');
    const [isCloseBudgetModalOpen, setIsCloseBudgetModalOpen] = useState(false);
    const [destinationPocketId, setDestinationPocketId] = useState('');

    // Report State
    const [reportDateRange, setReportDateRange] = useState(getInitialDateRange);
    const [reportVisuals, setReportVisuals] = useState<ReportVisuals | null>(null);
    const [reportSummary, setReportSummary] = useState({ income: 0, expense: 0, net: 0, prevIncome: 0, prevExpense: 0 });
    const [reportChartData, setReportChartData] = useState<{ date: string; income: number; expense: number }[]>([]);
    const [clientProfitability, setClientProfitability] = useState<{ name: string; profit: number }[]>([]);
    const [profitReportDate, setProfitReportDate] = useState(new Date().toISOString().slice(0, 7));
    const [reportDetailTab, setReportDetailTab] = useState<'projects' | 'clients'>('projects');
    const [expandedProfitRows, setExpandedProfitRows] = useState<Set<string>>(new Set());


    const recalculateExpensePocketTotals = (currentTransactions: Transaction[], currentPockets: FinancialPocket[]): FinancialPocket[] => {
        return currentPockets.map(pocket => {
            if (pocket.type === PocketType.EXPENSE) {
                const spentAmount = currentTransactions
                    .filter(t => t.pocketId === pocket.id && t.type === TransactionType.EXPENSE)
                    .reduce((sum, t) => sum + t.amount, 0);
                return { ...pocket, amount: spentAmount };
            }
            return pocket;
        });
    };

    useEffect(() => {
        if (transactionModalMode === 'edit' && selectedTransaction) {
            setTransactionFormData(selectedTransaction);
        } else {
            setTransactionFormData(emptyTransaction);
        }
    }, [transactionModalMode, selectedTransaction]);
    
    useEffect(() => {
        if ((pocketModalMode === 'edit' || pocketModalMode === 'manage') && selectedPocket) {
            setPocketFormData(selectedPocket);
        } else {
            setPocketFormData(emptyPocket);
        }
    }, [pocketModalMode, selectedPocket]);

    const summary = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        const mainBalance = totalIncome - totalExpense;
        return { totalIncome, totalExpense, mainBalance };
    }, [transactions]);
    
     const baseFilteredTransactions = useMemo(() => {
        const searchLower = filters.search.toLowerCase();
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(23, 59, 59, 999);

            if (fromDate && transactionDate < fromDate) return false;
            if (toDate && transactionDate > toDate) return false;
            if (filters.type !== 'all' && t.type !== filters.type) return false;
            if (searchLower && !t.description.toLowerCase().includes(searchLower) && !t.category.toLowerCase().includes(searchLower)) return false;

            return true;
        });
    }, [transactions, filters]);
    
    const expenseCategorySummary = useMemo(() => {
        const expenseTransactions = baseFilteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
        const summary = expenseTransactions.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = { total: 0, count: 0 };
            }
            acc[t.category].total += t.amount;
            acc[t.category].count += 1;
            return acc;
        }, {} as Record<string, { total: number, count: number }>);

        return Object.entries(summary)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
    }, [baseFilteredTransactions]);

    const incomeCategorySummary = useMemo(() => {
        const incomeTransactions = baseFilteredTransactions.filter(t => t.type === TransactionType.INCOME);
        const summary = incomeTransactions.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = { total: 0, count: 0 };
            }
            acc[t.category].total += t.amount;
            acc[t.category].count += 1;
            return acc;
        }, {} as Record<string, { total: number, count: number }>);

        return Object.entries(summary)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
    }, [baseFilteredTransactions]);


    const filteredTransactions = useMemo(() => {
        if (activeExpenseCategory !== 'all') {
            return baseFilteredTransactions.filter(t => t.type === TransactionType.EXPENSE && t.category === activeExpenseCategory);
        }
        if (activeIncomeCategory !== 'all') {
            return baseFilteredTransactions.filter(t => t.type === TransactionType.INCOME && t.category === activeIncomeCategory);
        }
        return baseFilteredTransactions;
    }, [baseFilteredTransactions, activeExpenseCategory, activeIncomeCategory]);
    
    const filteredSummary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions]);
    
    const { pocketsTotal, totalAssets } = useMemo(() => {
        const totalInPockets = pockets
            .filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED)
            .reduce((sum, p) => sum + p.amount, 0);
        return {
            pocketsTotal: totalInPockets,
            totalAssets: summary.mainBalance + totalInPockets,
        };
    }, [pockets, summary.mainBalance]);

    const monthlyBudgetPocketContext = useMemo(() => {
        const budgetPocket = pockets.find(p => p.type === PocketType.EXPENSE);
        if (!budgetPocket) return null;

        const now = new Date();
        const spentThisMonth = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.pocketId === budgetPocket.id &&
                       t.type === TransactionType.EXPENSE &&
                       tDate.getMonth() === now.getMonth() &&
                       tDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const budget = budgetPocket.goalAmount || 0;
        const remaining = budget - spentThisMonth;

        return {
            pocket: budgetPocket,
            spent: spentThisMonth,
            budget,
            remaining,
        }
    }, [pockets, transactions]);

    // --- Transaction Handlers ---
    const handleOpenTransactionModal = (mode: 'add' | 'edit', transaction?: Transaction) => {
        setTransactionModalMode(mode);
        setSelectedTransaction(transaction || null);
        setIsTransactionModalOpen(true);
    };

    const handleCloseTransactionModal = () => {
        setIsTransactionModalOpen(false);
        setSelectedTransaction(null);
        setTransactionFormData(emptyTransaction);
    };

    const handleTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTransactionFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    };

    const handleTransactionFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let updatedTransactions: Transaction[] = [];

        if (transactionModalMode === 'add') {
            const newTransaction = { ...transactionFormData, id: `TRN${Date.now()}` };
            updatedTransactions = [newTransaction, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (transactionModalMode === 'edit' && selectedTransaction) {
            updatedTransactions = transactions.map(t =>
                t.id === selectedTransaction.id ? { ...selectedTransaction, ...transactionFormData } : t
            ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        setTransactions(updatedTransactions);
        setPockets(prevPockets => recalculateExpensePocketTotals(updatedTransactions, prevPockets));
        handleCloseTransactionModal();
    };

    const handleTransactionDelete = (transactionId: string) => {
        if (window.confirm("Yakin ingin menghapus transaksi ini? Menghapus transaksi transfer akan mempengaruhi saldo kantong Anda.")) {
            const transactionToDelete = transactions.find(t => t.id === transactionId);
            if (!transactionToDelete) return;

            let updatedTransactions = transactions.filter(t => t.id !== transactionId);
            let updatedPockets = [...pockets];
            
            if (transactionToDelete.pocketId && transactionToDelete.category === 'Transfer Antar Kantong') {
                const pocketToUpdate = updatedPockets.find(p => p.id === transactionToDelete.pocketId);
                
                if (pocketToUpdate && pocketToUpdate.type !== PocketType.EXPENSE) {
                     updatedPockets = updatedPockets.map(p => {
                        if (p.id === pocketToUpdate.id) {
                            let newAmount = p.amount;
                            if (transactionToDelete.type === TransactionType.INCOME) { // Reverse of topup is income
                                newAmount -= transactionToDelete.amount;
                            } else { // Reverse of withdraw is expense
                                newAmount += transactionToDelete.amount;
                            }
                            return { ...p, amount: newAmount < 0 ? 0 : newAmount };
                        }
                        return p;
                    });
                }
            }
            
            const finalPockets = recalculateExpensePocketTotals(updatedTransactions, updatedPockets);
            
            setTransactions(updatedTransactions);
            setPockets(finalPockets);
        }
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    }

    const handleSelectExpenseCategory = (category: string) => {
        setActiveExpenseCategory(category);
        setActiveIncomeCategory('all');
    };
    
    const handleSelectIncomeCategory = (category: string) => {
        setActiveIncomeCategory(category);
        setActiveExpenseCategory('all');
    };
    
    const handleClearCategoryFilters = () => {
        setActiveIncomeCategory('all');
        setActiveExpenseCategory('all');
    };

    // --- Pocket Handlers ---
    const handleOpenPocketModal = (mode: 'add' | 'edit' | 'manage', pocket?: FinancialPocket) => {
        setPocketModalMode(mode);
        setSelectedPocket(pocket || null);
        setManageAmount('');
        setIsPocketModalOpen(true);
    };

    const handleClosePocketModal = () => {
        setIsPocketModalOpen(false);
        setSelectedPocket(null);
        setPocketFormData(emptyPocket);
    };

    const handlePocketFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFormData: Omit<FinancialPocket, 'id'> = { ...pocketFormData, [name]: name === 'amount' || name === 'goalAmount' ? Number(value) : value };
        if(name === 'type') {
            newFormData.icon = value === PocketType.SAVING ? 'piggy-bank' : value === PocketType.LOCKED ? 'lock' : value === PocketType.SHARED ? 'users' : 'clipboard-list';
        }
        setPocketFormData(newFormData);
    };

    const handlePocketFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pocketModalMode === 'add') {
            const newPocketId = `POC${Date.now()}`;
            const newPocket: FinancialPocket = { ...pocketFormData, id: newPocketId };
            
            if(newPocket.type === PocketType.EXPENSE) {
                newPocket.amount = 0;
            }

            setPockets(prev => [...prev, newPocket]);

            if (newPocket.amount > 0 && newPocket.type !== PocketType.EXPENSE) {
                 const transferTransaction: Transaction = {
                    id: `TRN-INIT-${newPocket.id}`,
                    date: new Date().toISOString().split('T')[0],
                    description: `Transfer ke kantong: ${newPocket.name}`,
                    amount: newPocket.amount,
                    type: TransactionType.EXPENSE,
                    category: 'Transfer Antar Kantong',
                    method: 'Transfer Bank',
                    pocketId: newPocket.id,
                };
                setTransactions(prev => [transferTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }

        } else if (pocketModalMode === 'edit' && selectedPocket) {
            setPockets(prev => prev.map(p => p.id === selectedPocket.id ? { ...selectedPocket, ...pocketFormData } : p));
        }
        handleClosePocketModal();
    };

    const handlePocketDelete = (pocketToDelete: FinancialPocket) => {
        if (window.confirm(`Yakin ingin menghapus kantong "${pocketToDelete.name}"? Saldo akan dikembalikan ke Saldo Utama dan riwayat transfer terkait akan dihapus.`)) {
            let newTransactions = [...transactions];
            
            if (pocketToDelete.type === PocketType.SAVING || pocketToDelete.type === PocketType.LOCKED) {
                if (pocketToDelete.amount > 0) {
                    const closingTransaction: Transaction = {
                        id: `TRN-CLOSE-${pocketToDelete.id}`,
                        date: new Date().toISOString().split('T')[0],
                        description: `Dana kembali dari penutupan kantong: ${pocketToDelete.name}`,
                        amount: pocketToDelete.amount,
                        type: TransactionType.INCOME,
                        category: 'Transfer Antar Kantong',
                        method: 'Transfer Bank',
                    };
                    newTransactions.push(closingTransaction);
                }
                
                newTransactions = newTransactions.filter(t => 
                    !(t.pocketId === pocketToDelete.id && t.category === 'Transfer Antar Kantong')
                );

            } 
            else if (pocketToDelete.type === PocketType.EXPENSE) {
                newTransactions = newTransactions.map(t => {
                    if (t.pocketId === pocketToDelete.id) {
                        const { pocketId, ...remainingT } = t;
                        return remainingT;
                    }
                    return t;
                }) as Transaction[];
            }

            const updatedPockets = pockets.filter(p => p.id !== pocketToDelete.id);
            setTransactions(newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setPockets(updatedPockets);
        }
    };
    
    const handleManagePocket = (action: 'topup' | 'withdraw') => {
        const amount = Number(manageAmount);
        if (selectedPocket && amount > 0) {
            
            if (action === 'withdraw' && amount > selectedPocket.amount) {
                alert('Saldo kantong tidak mencukupi untuk penarikan.');
                return;
            }
            
            const newTransaction: Transaction = {
                id: `TRN-MNG-${selectedPocket.id}-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                description: `${action === 'topup' ? 'Top up ke' : 'Tarik dana dari'} kantong: ${selectedPocket.name}`,
                amount: amount,
                type: action === 'topup' ? TransactionType.EXPENSE : TransactionType.INCOME,
                category: 'Transfer Antar Kantong',
                method: 'Transfer Bank',
                pocketId: selectedPocket.id,
            };

            setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            setPockets(prev => prev.map(p => {
                if (p.id === selectedPocket.id) {
                    const newAmount = action === 'topup' ? p.amount + amount : p.amount - amount;
                    return { ...p, amount: newAmount };
                }
                return p;
            }));

            handleClosePocketModal();
        }
    };

    const handleOpenCloseBudgetModal = () => {
        const savingPockets = pockets.filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED);
        if (savingPockets.length > 0) {
            setDestinationPocketId(savingPockets[0].id);
        }
        setIsCloseBudgetModalOpen(true);
    };

    const handleConfirmCloseBudget = () => {
        if (!monthlyBudgetPocketContext || !destinationPocketId) return;
        
        const { remaining } = monthlyBudgetPocketContext;
        const destinationPocket = pockets.find(p => p.id === destinationPocketId);

        if (!destinationPocket || remaining <= 0) {
            alert("Tidak ada sisa anggaran untuk dipindahkan atau kantong tujuan tidak valid.");
            setIsCloseBudgetModalOpen(false);
            return;
        }
        
        const finalTransferTransaction: Transaction = {
             id: `TRN-CLOSE-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Transfer sisa anggaran ke ${destinationPocket.name}`,
            amount: remaining,
            type: TransactionType.EXPENSE,
            category: 'Transfer Antar Kantong',
            method: 'Sistem',
            pocketId: monthlyBudgetPocketContext.pocket.id, // Expense is against the budget pocket
        }
        
        let newTransactions = [...transactions, finalTransferTransaction];
        
        const newPockets = pockets.map(p => 
            p.id === destinationPocketId ? { ...p, amount: p.amount + remaining } : p
        );

        const finalPockets = recalculateExpensePocketTotals(newTransactions, newPockets);
        
        setTransactions(newTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setPockets(finalPockets);
        setIsCloseBudgetModalOpen(false);
    };

    // --- Report Handlers ---
    useEffect(() => {
        if (activeTab !== 'reports' || !reportDateRange.from || !reportDateRange.to) return;

        // Current period transactions
        const periodStart = new Date(reportDateRange.from);
        const periodEnd = new Date(reportDateRange.to);
        periodEnd.setHours(23, 59, 59, 999);

        const reportTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= periodStart && transactionDate <= periodEnd;
        });

        // Previous period calculations
        const duration = periodEnd.getTime() - periodStart.getTime();
        const prevPeriodEnd = new Date(periodStart.getTime() - 24 * 60 * 60 * 1000);
        const prevPeriodStart = new Date(prevPeriodEnd.getTime() - duration);
        prevPeriodEnd.setHours(23, 59, 59, 999);

        const prevTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= prevPeriodStart && transactionDate <= prevPeriodEnd;
        });

        const income = reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense = reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        const prevIncome = prevTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const prevExpense = prevTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

        setReportSummary({ income, expense, net: income - expense, prevIncome, prevExpense });

        // Line chart aggregation
        const dailyData = new Map<string, { income: number, expense: number }>();
        reportTransactions.forEach(t => {
            const dateKey = t.date;
            const entry = dailyData.get(dateKey) || { income: 0, expense: 0 };
            if (t.type === TransactionType.INCOME) entry.income += t.amount; else entry.expense += t.amount;
            dailyData.set(dateKey, entry);
        });
        const chartData = Array.from(dailyData.entries()).map(([date, values]) => ({ date, ...values })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setReportChartData(chartData);
        
        // Client profitability
        const projectClientMap = projects.reduce((acc, p) => { if(p.clientId) acc[p.id] = {clientName: p.clientName}; return acc; }, {} as Record<string, {clientName: string}>);
        const clientProfitMap = new Map<string, { name: string, profit: number }>();
        reportTransactions.forEach(t => {
            if (t.projectId && projectClientMap[t.projectId]) {
                const clientInfo = projectClientMap[t.projectId];
                const clientEntry = clientProfitMap.get(clientInfo.clientName) || { name: clientInfo.clientName, profit: 0 };
                clientEntry.profit += (t.type === TransactionType.INCOME ? t.amount : -t.amount);
                clientProfitMap.set(clientInfo.clientName, clientEntry);
            }
        });
        const clientProfitData = Array.from(clientProfitMap.values()).sort((a,b) => b.profit - a.profit);
        setClientProfitability(clientProfitData);

        // Donut and project profitability (existing logic)
        const incomeSources = reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
        const expenseCategories = reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
        const profitableProjects = projects.map(proj => {
            const projectIncome = reportTransactions.filter(t => t.projectId === proj.id && t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
            const projectExpense = reportTransactions.filter(t => t.projectId === proj.id && t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
            return { name: proj.projectName, profit: projectIncome - projectExpense };
        }).filter(p => p.profit > 0).sort((a,b) => b.profit - a.profit);

        setReportVisuals({
            incomeSources: Object.entries(incomeSources).map(([label, value]) => ({label, value})),
            expenseCategories: Object.entries(expenseCategories).map(([label, value]) => ({label, value})),
            profitableProjects
        });
    }, [reportDateRange, transactions, projects, activeTab]);

    const profitabilityReportData = useMemo(() => {
        const [year, month] = profitReportDate.split('-').map(Number);
        const targetMonth = month - 1;

        const completedProjectsInMonth = projects.filter(p => {
            const projectDate = new Date(p.date);
            return p.status === ProjectStatus.COMPLETED &&
                   projectDate.getFullYear() === year &&
                   projectDate.getMonth() === targetMonth;
        });
        
        if (completedProjectsInMonth.length === 0) {
            return { summary: { income: 0, expense: 0, net: 0 }, details: [] };
        }

        const projectIds = completedProjectsInMonth.map(p => p.id);
        const relevantTransactions = transactions.filter(t => t.projectId && projectIds.includes(t.projectId));

        const perProjectDetails = completedProjectsInMonth.map(p => {
            const projectTransactions = relevantTransactions.filter(t => t.projectId === p.id);
            const incomeTransactions = projectTransactions.filter(t => t.type === TransactionType.INCOME);
            const expenseTransactions = projectTransactions.filter(t => t.type === TransactionType.EXPENSE);

            const income = incomeTransactions.reduce((s, t) => s + t.amount, 0);
            const expense = expenseTransactions.reduce((s, t) => s + t.amount, 0);

            return {
                id: p.id,
                name: p.projectName,
                income,
                expense,
                net: income - expense,
                incomeTransactions,
                expenseTransactions,
            };
        });

        const summary = perProjectDetails.reduce((acc, p) => {
            acc.income += p.income;
            acc.expense += p.expense;
            acc.net += p.net;
            return acc;
        }, { income: 0, expense: 0, net: 0 });

        return { summary, details: perProjectDetails };

    }, [profitReportDate, projects, transactions]);

    const handleDownloadCsv = () => {
        const reportTransactions = transactions.filter(t => {
             const transactionDate = new Date(t.date);
            const fromDate = reportDateRange.from ? new Date(reportDateRange.from) : null;
            const toDate = reportDateRange.to ? new Date(reportDateRange.to) : null;

            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(23, 59, 59, 999);

            if (fromDate && transactionDate < fromDate) return false;
            if (toDate && transactionDate > toDate) return false;
            return true;
        });

        const headers = ["Tanggal", "Deskripsi", "Kategori", "Proyek", "Jenis", "Jumlah", "Metode", "Kantong Anggaran"];
        
        const csvRows = [
            headers.join(','),
            ...reportTransactions.map(row => {
                const pocketName = row.pocketId ? pockets.find(p=>p.id === row.pocketId)?.name : '';
                const projectName = row.projectId ? projects.find(p=>p.id === row.projectId)?.projectName : '';
                return [
                    row.date,
                    `"${row.description.replace(/"/g, '""')}"`,
                    row.category,
                    projectName || '',
                    row.type,
                    row.amount,
                    row.method,
                    pocketName || ''
                ].join(',');
            })
        ];
        csvRows.push('');
        csvRows.push(`"Total Pemasukan",${reportSummary.income}`);
        csvRows.push(`"Total Pengeluaran",${reportSummary.expense}`);
        csvRows.push(`"Laba/Rugi Bersih",${reportSummary.net}`);
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `laporan_keuangan_${reportDateRange.from || 'awal'}_sd_${reportDateRange.to || 'akhir'}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleProfitabilityCsvDownload = () => {
        const { details, summary } = profitabilityReportData;
        if (details.length === 0) {
            alert("Tidak ada data untuk diunduh.");
            return;
        }

        const headers = ["Nama Proyek", "Tanggal", "Deskripsi", "Pemasukan", "Pengeluaran"];
        let csvRows = [headers.join(',')];

        details.forEach(p => {
            csvRows.push(`"${p.name.replace(/"/g, '""')}","","","",""`);
            
            const allTransactions = [
                ...p.incomeTransactions.map(t => ({...t, type: 'income'})),
                ...p.expenseTransactions.map(t => ({...t, type: 'expense'}))
            ].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            allTransactions.forEach(t => {
                csvRows.push([
                    "",
                    `"${t.date}"`,
                    `"${t.description.replace(/"/g, '""')}"`,
                    t.type === 'income' ? t.amount : 0,
                    t.type === 'expense' ? t.amount : 0
                ].join(','));
            });
            
            csvRows.push([
                `"Total ${p.name.replace(/"/g, '""')}"`,
                "",
                `"Laba/Rugi: ${formatCurrency(p.net)}"`,
                p.income,
                p.expense
            ].join(','));

            csvRows.push("");
        });
        
        csvRows.push("");
        csvRows.push(`"TOTAL KESELURUHAN", "", "Laba/Rugi Bersih: ${formatCurrency(summary.net)}", ${summary.income}, ${summary.expense}`);

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan_profitabilitas_${profitReportDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const getComparisonChip = (current: number, previous: number) => {
        if (previous === 0) {
            return current > 0 ? <span className="text-xs font-medium text-emerald-600 ml-2">(Baru)</span> : <span className="text-xs font-medium text-slate-500 ml-2">(-.--)</span>;
        }
        const change = ((current - previous) / Math.abs(previous)) * 100;
        const isIncrease = change >= 0;
        const color = isIncrease ? 'text-emerald-600' : 'text-red-600';
        return (
            <span className={`text-xs font-semibold ${color}`}>
                {isIncrease ? '▲' : '▼'} {Math.abs(change).toFixed(0)}%
            </span>
        );
    };

    const toggleProfitRow = (projectId: string) => {
        setExpandedProfitRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'transactions':
                return (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-200 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-emerald-700"><path d="M12 5v14m7-7-7-7-7 7"/></svg>
                                    </div>
                                    <h3 className="font-semibold text-lg text-emerald-800">Total Pemasukan</h3>
                                </div>
                                <p className="text-3xl font-bold text-emerald-900 mt-4">{formatCurrency(summary.totalIncome)}</p>
                                <p className="text-sm text-emerald-700">Total dari semua waktu</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-200 rounded-full">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-red-700"><path d="M12 19V5m-7 7 7 7 7-7"/></svg>
                                    </div>
                                    <h3 className="font-semibold text-lg text-red-800">Total Pengeluaran</h3>
                                </div>
                                <p className="text-3xl font-bold text-red-900 mt-4">{formatCurrency(summary.totalExpense)}</p>
                                <p className="text-sm text-red-700">Total dari semua waktu</p>
                            </div>
                             <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-200 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-slate-700"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                    </div>
                                    <h3 className="font-semibold text-lg text-slate-800">Saldo Utama</h3>
                                </div>
                                <p className="text-3xl font-bold text-slate-900 mt-4">{formatCurrency(summary.mainBalance)}</p>
                                <p className="text-sm text-slate-500">Pemasukan - Pengeluaran</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {monthlyBudgetPocketContext ? (
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-lg text-slate-800">{monthlyBudgetPocketContext.pocket.name}</h3>
                                        <button onClick={handleOpenCloseBudgetModal} disabled={monthlyBudgetPocketContext.remaining <= 0} className="button-secondary text-xs px-3 py-1.5 disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400">Tutup & Kunci Sisa</button>
                                    </div>
                                     <div className="mt-2">
                                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(monthlyBudgetPocketContext.remaining)}</p>
                                        <p className="text-sm text-slate-500">Sisa dari budget {formatCurrency(monthlyBudgetPocketContext.budget)}</p>
                                    </div>
                                    <div className="mt-4">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${Math.min((monthlyBudgetPocketContext.spent / monthlyBudgetPocketContext.budget) * 100, 100)}%` }}></div>
                                        </div>
                                         <p className="text-xs text-slate-500 mt-1">Terpakai: {formatCurrency(monthlyBudgetPocketContext.spent)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-center text-center">
                                    <p className="text-slate-500">Belum ada kantong anggaran bulanan. <br/>Buat di tab "Kantong Keuangan".</p>
                                </div>
                            )}
                             <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-semibold text-lg text-slate-800">Total Aset</h3>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalAssets)}</p>
                                <p className="text-sm text-slate-500 mt-1">Saldo Utama + Saldo di semua kantong.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-y border-slate-200 mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div><label className="input-label">Dari Tanggal</label><input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="input-field"/></div>
                                <div><label className="input-label">Sampai Tanggal</label><input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="input-field"/></div>
                                <div>
                                    <label className="input-label">Jenis</label>
                                    <select name="type" value={filters.type} onChange={handleFilterChange} className="input-field">
                                        <option value="all">Semua Jenis</option>
                                        <option value={TransactionType.INCOME}>Pemasukan</option>
                                        <option value={TransactionType.EXPENSE}>Pengeluaran</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Cari Deskripsi/Kategori</label>
                                    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Cari..." className="input-field"/>
                                </div>
                            </div>
                        </div>

                         <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                            <div className="lg:col-span-1">
                                <h4 className="font-semibold text-slate-800">Ringkasan Sesuai Filter</h4>
                                <p className="text-xs text-slate-500">Menampilkan {filteredTransactions.length} transaksi</p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                <span className="text-sm text-emerald-800">Pemasukan</span>
                                <span className="font-bold text-emerald-800">{formatCurrency(filteredSummary.income)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-sm text-red-800">Pengeluaran</span>
                                <span className="font-bold text-red-800">{formatCurrency(filteredSummary.expense)}</span>
                            </div>
                            <MiniCashFlowChart income={filteredSummary.income} expense={filteredSummary.expense}/>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-600 mb-2 ml-1">Kategori Pemasukan</h4>
                                <div className="flex flex-nowrap gap-4 pb-3 overflow-x-auto">
                                    <button
                                        type="button"
                                        onClick={handleClearCategoryFilters}
                                        className={`p-4 rounded-xl border-2 text-left flex-shrink-0 w-48 transition-all duration-200 ${(activeIncomeCategory === 'all' && activeExpenseCategory === 'all') ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 hover:border-slate-400'}`}
                                    >
                                        <p className="font-bold text-base">Semua Transaksi</p>
                                        <p className={`text-sm ${(activeIncomeCategory === 'all' && activeExpenseCategory === 'all') ? 'text-slate-300' : 'text-slate-500'}`}>{transactions.length} transaksi</p>
                                    </button>
                                    {incomeCategorySummary.map(({ category, total, count }) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => handleSelectIncomeCategory(category)}
                                            className={`p-4 rounded-xl border-2 text-left flex-shrink-0 w-48 transition-all duration-200 ${activeIncomeCategory === category ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 hover:border-emerald-400'}`}
                                        >
                                            <p className="font-bold text-base truncate">{category}</p>
                                            <p className="text-xl font-semibold mt-1">{formatCurrency(total)}</p>
                                            <p className={`text-xs ${activeIncomeCategory === category ? 'text-emerald-100' : 'text-slate-500'}`}>{count} transaksi</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-semibold text-slate-600 mb-2 ml-1">Kategori Pengeluaran</h4>
                                <div className="flex flex-nowrap gap-4 pb-3 overflow-x-auto">
                                    {expenseCategorySummary.map(({ category, total, count }) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => handleSelectExpenseCategory(category)}
                                            className={`p-4 rounded-xl border-2 text-left flex-shrink-0 w-48 transition-all duration-200 ${activeExpenseCategory === category ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 hover:border-red-400'}`}
                                        >
                                            <p className="font-bold text-base truncate">{category}</p>
                                            <p className="text-xl font-semibold mt-1">{formatCurrency(total)}</p>
                                            <p className={`text-xs ${activeExpenseCategory === category ? 'text-red-100' : 'text-slate-500'}`}>{count} transaksi</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                        <tr>{['Tanggal', 'Deskripsi', 'Proyek Terkait', 'Kategori', 'Jenis', 'Jumlah', 'Aksi'].map(h => <th key={h} className="px-6 py-3 tracking-wider">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredTransactions.map(t => {
                                            const projectName = t.projectId ? projects.find(p => p.id === t.projectId)?.projectName : '-';
                                            return (
                                                <tr key={t.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                                                    <td className="px-6 py-4">{projectName}</td>
                                                    <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs"><TagIcon className="w-3 h-3"/>{t.category}</span></td>
                                                    <td className="px-6 py-4">{t.type}</td>
                                                    <td className={`px-6 py-4 font-medium ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <button type="button" onClick={() => handleOpenTransactionModal('edit', t)} className="text-slate-500 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                                            <button type="button" onClick={() => handleTransactionDelete(t.id)} className="text-slate-500 hover:text-red-600"><Trash2Icon className="w-5 h-5"/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                {filteredTransactions.length === 0 && (
                                    <div className="text-center py-16 text-slate-500">
                                        <p>Tidak ada transaksi yang cocok dengan filter Anda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            case 'pockets':
                 return (
                    <div className="p-6">
                        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg mb-6 flex items-center justify-around text-center">
                            <div className="text-lg">
                                <span className="font-mono">{formatCurrency(summary.mainBalance)}</span>
                                <p className="text-xs">Saldo Utama</p>
                            </div>
                            <span className="text-2xl font-light">+</span>
                            <div className="text-lg">
                                 <span className="font-mono">{formatCurrency(pocketsTotal)}</span>
                                <p className="text-xs">Total di Kantong</p>
                            </div>
                            <span className="text-2xl font-light">=</span>
                             <div className="text-xl font-bold">
                                 <span className="font-mono">{formatCurrency(totalAssets)}</span>
                                <p className="text-xs font-medium">Total Aset Anda</p>
                            </div>
                        </div>

                        <button onClick={() => handleOpenPocketModal('add')} className="mb-6 inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700">
                            <PlusIcon className="w-5 h-5"/> Buat Kantong Baru
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pockets.map(pocket => {
                                const progress = (pocket.goalAmount && pocket.goalAmount > 0) ? (pocket.amount / pocket.goalAmount) * 100 : 0;
                                const isExpenseOverBudget = pocket.type === PocketType.EXPENSE && progress > 100;
                                const progressBarColor = isExpenseOverBudget ? 'bg-red-500' : pocket.type === PocketType.EXPENSE ? 'bg-amber-500' : 'bg-pink-500';
                                return (
                                <div key={pocket.id} className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between hover:shadow-lg transition-shadow">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3 mb-2">
                                                {pocket.icon === 'piggy-bank' && <PiggyBankIcon className="w-6 h-6 text-pink-500" />}
                                                {pocket.icon === 'lock' && <LockIcon className="w-6 h-6 text-red-500" />}
                                                {pocket.icon === 'users' && <Users2Icon className="w-6 h-6 text-blue-500" />}
                                                {pocket.icon === 'clipboard-list' && <ClipboardListIcon className="w-6 h-6 text-amber-500" />}
                                                <span className="font-semibold text-slate-700 text-lg">{pocket.name}</span>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pocket.type === PocketType.EXPENSE ? 'bg-amber-100 text-amber-800' : 'bg-pink-100 text-pink-800'}`}>
                                               {pocket.type === PocketType.EXPENSE ? 'Pelacak Pengeluaran' : 'Dana Riil'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-500 mb-4 h-10">{pocket.description}</p>
                                        <p className="text-3xl font-bold text-slate-800">{formatCurrency(pocket.amount)}</p>
                                        
                                        {pocket.type !== PocketType.LOCKED && pocket.goalAmount && (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs text-slate-500">
                                                    <span>{pocket.type === PocketType.EXPENSE ? 'Terpakai' : 'Terkumpul'}</span>
                                                    <span>Target: {formatCurrency(pocket.goalAmount)}</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                                                    <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                </div>
                                                {isExpenseOverBudget && <p className="text-xs text-red-500 font-semibold mt-1">Melebihi budget!</p>}
                                            </div>
                                        )}

                                        {pocket.type === PocketType.LOCKED && pocket.lockEndDate && (
                                            <p className="text-xs text-red-600 mt-2 font-semibold">Terkunci hingga {new Date(pocket.lockEndDate).toLocaleDateString('id-ID')}</p>
                                        )}
                                    </div>
                                    
                                    <div className="mt-6 flex items-center justify-between gap-2">
                                        <button type="button" disabled={pocket.type === PocketType.EXPENSE} onClick={() => handleOpenPocketModal('manage', pocket)} className="flex-1 py-2 px-3 text-xs font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400">
                                            Kelola Dana
                                        </button>
                                        <div className="flex items-center">
                                            <button type="button" onClick={() => handleOpenPocketModal('edit', pocket)} className="p-2 text-slate-500 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                            <button type="button" onClick={() => handlePocketDelete(pocket)} className="p-2 text-slate-500 hover:text-red-600"><Trash2Icon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )
            case 'reports':
                return (
                    <div className="p-2 md:p-6 space-y-8">
                        <div>
                             <h3 className="text-xl font-semibold text-slate-900 mb-4">Laporan Keuangan Umum</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-8">
                                <div><label className="input-label">Dari Tanggal</label><input type="date" value={reportDateRange.from} onChange={e => setReportDateRange(p => ({...p, from: e.target.value}))} className="input-field"/></div>
                                <div><label className="input-label">Sampai Tanggal</label><input type="date" value={reportDateRange.to} onChange={e => setReportDateRange(p => ({...p, to: e.target.value}))} className="input-field"/></div>
                                 <div className="text-right">
                                    <button type="button" onClick={handleDownloadCsv} className="button-secondary">
                                        Unduh sebagai CSV
                                    </button>
                                </div>
                            </div>
                             {reportVisuals ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="p-4 bg-emerald-50 rounded-lg text-emerald-800"><p className="flex justify-between items-center">Total Pemasukan {getComparisonChip(reportSummary.income, reportSummary.prevIncome)}</p><p className="font-bold text-2xl">{formatCurrency(reportSummary.income)}</p></div>
                                        <div className="p-4 bg-red-50 rounded-lg text-red-800"><p className="flex justify-between items-center">Total Pengeluaran {getComparisonChip(reportSummary.expense, reportSummary.prevExpense)}</p><p className="font-bold text-2xl">{formatCurrency(reportSummary.expense)}</p></div>
                                        <div className="p-4 bg-blue-50 rounded-lg text-blue-800"><p className="flex justify-between items-center">Laba/Rugi Bersih {getComparisonChip(reportSummary.net, reportSummary.prevIncome - reportSummary.prevExpense)}</p><p className="font-bold text-2xl">{formatCurrency(reportSummary.net)}</p></div>
                                    </div>

                                     <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-lg font-semibold text-slate-800">Tren Pemasukan vs Pengeluaran</h3>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-400 rounded-sm"></span>Pemasukan</div>
                                                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-400 rounded-sm"></span>Pengeluaran</div>
                                            </div>
                                        </div>
                                        {reportChartData.length > 1 ? <LineChart data={reportChartData} /> : <div className="text-center text-slate-500 py-16">Data tidak cukup untuk menampilkan tren. Pilih rentang tanggal yang lebih panjang.</div>}
                                    </div>
                                     
                                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                         <div className="lg:col-span-2 space-y-6">
                                             <DonutChart data={reportVisuals.incomeSources} title="Sumber Pemasukan"/>
                                             <DonutChart data={reportVisuals.expenseCategories} title="Rincian Pengeluaran"/>
                                         </div>
                                         <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
                                             <div className="border-b mb-4">
                                                 <nav className="-mb-px flex space-x-6">
                                                     <button onClick={() => setReportDetailTab('projects')} className={`py-3 px-1 border-b-2 font-medium text-sm ${reportDetailTab === 'projects' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:border-slate-400'}`}>
                                                        <TrendingUpIcon className="w-5 h-5 mr-2 inline"/>Proyek Paling Menguntungkan
                                                     </button>
                                                     <button onClick={() => setReportDetailTab('clients')} className={`py-3 px-1 border-b-2 font-medium text-sm ${reportDetailTab === 'clients' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:border-slate-400'}`}>
                                                        <UsersIconSm className="w-5 h-5 mr-2 inline"/>Klien Paling Menguntungkan
                                                     </button>
                                                 </nav>
                                             </div>
                                             {reportDetailTab === 'projects' && (
                                                reportVisuals.profitableProjects.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm"><thead className="text-xs text-slate-700 uppercase bg-slate-50"><tr><th className="p-3 text-left font-semibold">Nama Proyek</th><th className="p-3 text-right font-semibold">Keuntungan Bersih</th></tr></thead><tbody className="divide-y">
                                                            {reportVisuals.profitableProjects.slice(0, 10).map(p => (<tr key={p.name}><td className="p-3 font-medium">{p.name}</td><td className="p-3 text-right font-medium text-emerald-600">{formatCurrency(p.profit)}</td></tr>))}
                                                        </tbody></table>
                                                    </div>
                                                ) : <p className="text-center text-slate-500 py-8">Tidak ada data keuntungan proyek pada periode ini.</p>
                                             )}
                                             {reportDetailTab === 'clients' && (
                                                clientProfitability.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm"><thead className="text-xs text-slate-700 uppercase bg-slate-50"><tr><th className="p-3 text-left font-semibold">Nama Klien</th><th className="p-3 text-right font-semibold">Keuntungan Bersih</th></tr></thead><tbody className="divide-y">
                                                            {clientProfitability.slice(0, 10).map(c => (<tr key={c.name}><td className="p-3 font-medium">{c.name}</td><td className="p-3 text-right font-medium text-emerald-600">{formatCurrency(c.profit)}</td></tr>))}
                                                        </tbody></table>
                                                    </div>
                                                ) : <p className="text-center text-slate-500 py-8">Tidak ada data keuntungan klien pada periode ini.</p>
                                             )}
                                         </div>
                                     </div>
                                </div>
                            ) : <div className="text-center py-16 text-slate-500">Memuat laporan...</div>}
                        </div>

                        <div className="mt-8 pt-8 border-t">
                             <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                                <h3 className="text-xl font-semibold text-slate-900">Laporan Profitabilitas Proyek Selesai</h3>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <label htmlFor="profit-month" className="sr-only">Pilih Bulan & Tahun</label>
                                        <input type="month" id="profit-month" value={profitReportDate} onChange={e => setProfitReportDate(e.target.value)} className="input-field max-w-xs"/>
                                    </div>
                                    <button type="button" onClick={handleProfitabilityCsvDownload} className="button-secondary inline-flex items-center gap-2">
                                        <DownloadIcon className="w-4 h-4"/>Unduh CSV
                                    </button>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-emerald-50 rounded-lg text-emerald-800"><p>Total Pemasukan</p><p className="font-bold text-2xl">{formatCurrency(profitabilityReportData.summary.income)}</p></div>
                                <div className="p-4 bg-red-50 rounded-lg text-red-800"><p>Total Pengeluaran</p><p className="font-bold text-2xl">{formatCurrency(profitabilityReportData.summary.expense)}</p></div>
                                <div className="p-4 bg-blue-50 rounded-lg text-blue-800"><p>Laba Bersih</p><p className="font-bold text-2xl">{formatCurrency(profitabilityReportData.summary.net)}</p></div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                         <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 tracking-wider text-left">Nama Proyek</th>
                                                <th className="px-6 py-3 tracking-wider text-right">Pemasukan</th>
                                                <th className="px-6 py-3 tracking-wider text-right">Pengeluaran</th>
                                                <th className="px-6 py-3 tracking-wider text-right">Laba/Rugi</th>
                                            </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-100">
                                            {profitabilityReportData.details.length === 0 && (
                                                <tr><td colSpan={4} className="text-center py-10 text-slate-500">Tidak ada proyek yang selesai pada periode ini.</td></tr>
                                            )}
                                            {profitabilityReportData.details.map(p => {
                                                const isExpanded = expandedProfitRows.has(p.id);
                                                return (
                                                    <React.Fragment key={p.id}>
                                                        <tr className="border-b border-slate-200">
                                                            <td className="px-6 py-4 font-medium">
                                                                <button onClick={() => toggleProfitRow(p.id)} className="flex items-center text-left w-full hover:text-blue-600 transition-colors">
                                                                    <ChevronRightIcon className={`w-5 h-5 mr-2 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                                    <span className="truncate">{p.name}</span>
                                                                </button>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">{formatCurrency(p.income)}</td>
                                                            <td className="px-6 py-4 text-right">{formatCurrency(p.expense)}</td>
                                                            <td className={`px-6 py-4 text-right font-bold ${p.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(p.net)}</td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr className="bg-slate-50/70">
                                                                <td colSpan={4} className="p-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div>
                                                                            <h5 className="font-semibold text-emerald-700 mb-2 pb-2 border-b">Rincian Pemasukan ({p.incomeTransactions.length})</h5>
                                                                            {p.incomeTransactions.length > 0 ? (
                                                                                <table className="w-full text-xs"><tbody>
                                                                                    {p.incomeTransactions.map(t => (
                                                                                        <tr key={t.id}>
                                                                                            <td className="py-1 pr-2 truncate" title={t.description}>{t.description}</td>
                                                                                            <td className="py-1 text-right font-medium">{formatCurrency(t.amount)}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody></table>
                                                                            ) : <p className="text-xs text-slate-500">Tidak ada pemasukan.</p>}
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="font-semibold text-red-700 mb-2 pb-2 border-b">Rincian Pengeluaran ({p.expenseTransactions.length})</h5>
                                                                             {p.expenseTransactions.length > 0 ? (
                                                                                <table className="w-full text-xs"><tbody>
                                                                                    {p.expenseTransactions.map(t => (
                                                                                        <tr key={t.id}>
                                                                                            <td className="py-1 pr-2 truncate" title={t.description}>{t.description}</td>
                                                                                            <td className="py-1 text-right font-medium">{formatCurrency(t.amount)}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody></table>
                                                                            ) : <p className="text-xs text-slate-500">Tidak ada pengeluaran.</p>}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                )
                                            })}
                                         </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            default: return null;
        }
    }

    return (
        <div>
            <PageHeader title="Manajemen Keuangan" subtitle="Pantau kesehatan finansial bisnis Anda.">
                {activeTab === 'transactions' && (
                    <button onClick={() => handleOpenTransactionModal('add')} className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700">
                        <PlusIcon className="w-5 h-5" />
                        Tambah Transaksi
                    </button>
                )}
            </PageHeader>
           
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button type="button" onClick={() => setActiveTab('transactions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transactions' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Transaksi</button>
                    <button type="button" onClick={() => setActiveTab('pockets')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pockets' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Kantong Keuangan</button>
                    <button type="button" onClick={() => setActiveTab('reports')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Laporan</button>
                </nav>
            </div>
            {renderContent()}

            <Modal isOpen={isTransactionModalOpen} onClose={handleCloseTransactionModal} title={transactionModalMode === 'add' ? 'Tambah Transaksi Baru' : 'Edit Transaksi'}>
                <form onSubmit={handleTransactionFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="input-label">Tanggal</label>
                           <input type="date" name="date" value={transactionFormData.date} onChange={handleTransactionFormChange} className="mt-1 input-field" required />
                        </div>
                        <div>
                            <label className="input-label">Jumlah (IDR)</label>
                            <input type="number" name="amount" value={transactionFormData.amount || ''} onChange={handleTransactionFormChange} className="mt-1 input-field" required />
                        </div>
                        <div className="md:col-span-2">
                           <label className="input-label">Deskripsi</label>
                           <input type="text" name="description" value={transactionFormData.description} onChange={handleTransactionFormChange} className="mt-1 input-field" required />
                        </div>
                         <div>
                            <label className="input-label">Jenis Transaksi</label>
                            <select name="type" value={transactionFormData.type} onChange={handleTransactionFormChange} className="mt-1 input-field">
                                <option value={TransactionType.EXPENSE}>Pengeluaran</option>
                                <option value={TransactionType.INCOME}>Pemasukan</option>
                            </select>
                        </div>
                        <div>
                           <label className="input-label">Kategori</label>
                           <input
                               type="text"
                               name="category"
                               list="category-suggestions"
                               placeholder="e.g., DP Proyek, Gaji"
                               value={transactionFormData.category}
                               onChange={handleTransactionFormChange}
                               className="mt-1 input-field"
                               required
                           />
                           <datalist id="category-suggestions">
                               {(transactionFormData.type === TransactionType.INCOME
                                   ? (profile.incomeCategories || [])
                                   : (profile.expenseCategories || [])
                               ).map(cat => (
                                   <option key={cat} value={cat} />
                               ))}
                           </datalist>
                        </div>
                        <div>
                           <label className="input-label">Proyek Terkait (Opsional)</label>
                           <select name="projectId" value={transactionFormData.projectId || ''} onChange={handleTransactionFormChange} className="mt-1 input-field">
                               <option value="">-- Tidak Terkait --</option>
                               {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                           </select>
                        </div>
                        {transactionFormData.type === TransactionType.EXPENSE && (
                            <div>
                                <label className="input-label">Kantong Anggaran (Opsional)</label>
                                <select name="pocketId" value={transactionFormData.pocketId || ''} onChange={handleTransactionFormChange} className="mt-1 input-field">
                                    <option value="">Tidak ada</option>
                                    {pockets.filter(p => p.type === PocketType.EXPENSE).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                         <div>
                            <label className="input-label">Metode Pembayaran</label>
                            <select name="method" value={transactionFormData.method} onChange={handleTransactionFormChange} className="mt-1 input-field">
                                <option>Transfer Bank</option>
                                <option>Tunai</option>
                                <option>E-Wallet</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-right pt-4">
                        <button type="button" onClick={handleCloseTransactionModal} className="mr-2 py-2 px-4 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Batal</button>
                        <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700">{transactionModalMode === 'add' ? 'Simpan' : 'Update'}</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isCloseBudgetModalOpen} onClose={() => setIsCloseBudgetModalOpen(false)} title="Tutup & Kunci Sisa Anggaran">
                 {monthlyBudgetPocketContext && (
                    <div className="space-y-4">
                        <p className="text-sm">Anda akan memindahkan sisa anggaran bulan ini ke kantong tabungan.</p>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <p className="text-slate-600">Sisa Anggaran yang Akan Dipindahkan</p>
                            <p className="text-2xl font-bold text-blue-800">{formatCurrency(monthlyBudgetPocketContext.remaining)}</p>
                        </div>
                        <div>
                            <label htmlFor="destinationPocket" className="input-label">Pindahkan Ke Kantong:</label>
                            <select id="destinationPocket" value={destinationPocketId} onChange={(e) => setDestinationPocketId(e.target.value)} className="input-field">
                                <option value="" disabled>Pilih kantong tujuan...</option>
                                {pockets.filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED).map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Saldo: {formatCurrency(p.amount)})</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-right pt-4 space-x-2">
                            <button type="button" onClick={() => setIsCloseBudgetModalOpen(false)} className="button-secondary">Batal</button>
                            <button type="button" onClick={handleConfirmCloseBudget} className="button-primary">Konfirmasi & Pindahkan</button>
                        </div>
                    </div>
                 )}
            </Modal>

            <Modal isOpen={isPocketModalOpen} onClose={handleClosePocketModal} title={
                pocketModalMode === 'add' ? 'Buat Kantong Baru' :
                pocketModalMode === 'edit' ? 'Edit Kantong' : `Kelola Dana: ${selectedPocket?.name}`
            }>
                {pocketModalMode === 'manage' && selectedPocket ? (
                    <div className="space-y-4">
                        <p>Saldo Saat Ini: <span className="font-bold">{formatCurrency(selectedPocket.amount)}</span></p>
                        <div>
                            <label className="input-label">Jumlah (IDR)</label>
                            <input type="number" value={manageAmount || ''} onChange={e => setManageAmount(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 input-field" placeholder="Masukkan jumlah"/>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => handleManagePocket('topup')} className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700">Top Up</button>
                            <button type="button" onClick={() => handleManagePocket('withdraw')} disabled={selectedPocket.type === PocketType.LOCKED} className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed">Tarik Dana</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handlePocketFormSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">Nama Kantong</label>
                            <input type="text" name="name" value={pocketFormData.name} onChange={handlePocketFormChange} className="mt-1 input-field" required/>
                        </div>
                        <div>
                            <label className="input-label">Deskripsi</label>
                            <textarea name="description" value={pocketFormData.description} onChange={handlePocketFormChange} rows={2} className="mt-1 input-field"></textarea>
                        </div>
                        <div>
                            <label className="input-label">Jenis Kantong</label>
                            <select name="type" value={pocketFormData.type} onChange={handlePocketFormChange} className="mt-1 input-field" disabled={pocketModalMode === 'edit'}>
                                {Object.values(PocketType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>

                        {pocketFormData.type !== PocketType.EXPENSE && pocketModalMode === 'add' && (
                            <div>
                                <label className="input-label">Saldo Awal (diambil dari Saldo Utama)</label>
                                <input type="number" name="amount" value={pocketFormData.amount || ''} onChange={handlePocketFormChange} className="mt-1 input-field" />
                            </div>
                        )}
                        
                        {(pocketFormData.type === PocketType.SAVING || pocketFormData.type === PocketType.EXPENSE) && (
                            <div>
                                <label className="input-label">{pocketFormData.type === PocketType.EXPENSE ? 'Budget Anggaran' : 'Target Nabung'} (IDR)</label>
                                <input type="number" name="goalAmount" value={pocketFormData.goalAmount || ''} onChange={handlePocketFormChange} className="mt-1 input-field" />
                            </div>
                        )}

                        {pocketFormData.type === PocketType.LOCKED && (
                            <div>
                                <label className="input-label">Tanggal Selesai Kunci</label>
                                <input type="date" name="lockEndDate" value={pocketFormData.lockEndDate || ''} onChange={handlePocketFormChange} className="mt-1 input-field" />
                            </div>
                        )}
                        
                        <div className="text-right pt-4">
                            <button type="button" onClick={handleClosePocketModal} className="mr-2 py-2 px-4 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Batal</button>
                            <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700">{pocketModalMode === 'add' ? 'Simpan' : 'Update'}</button>
                        </div>
                    </form>
                )}
            </Modal>

             <style>{`
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
                .input-field:focus { outline: none; border-color: #475569; box-shadow: 0 0 0 1px #475569; }
                .input-label { display: block; text-sm; font-medium; color: #475569; margin-bottom: 0.25rem; }
            `}</style>
        </div>
    );
};

export default Finance;
