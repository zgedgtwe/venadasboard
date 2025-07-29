import React, { useMemo, useState, useEffect } from 'react';
import { Project, Client, Transaction, TransactionType, ProjectStatus, ViewType, FinancialPocket, Package, PocketType, Lead, LeadStatus } from '../types';
import { NavigationAction } from '../App';
import PageHeader from './PageHeader';
import StatCard from './StatCard';
import { DollarSignIcon, FolderKanbanIcon, UsersIcon, AlertCircleIcon, CalendarIcon, StarIcon, PiggyBankIcon, PieChartIcon, TagIcon, LightbulbIcon, TargetIcon } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";


// Helper Functions
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// Child Components
const CashFlowChart: React.FC<{ data: { month: string; income: number; expense: number }[] }> = ({ data }) => {
    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

    return (
        <div className="flex justify-between items-end h-48 w-full gap-2 px-4 pt-4">
            {data.map(({ month, income, expense }) => {
                const incomeHeight = (income / maxVal) * 100;
                const expenseHeight = (expense / maxVal) * 100;
                return (
                    <div key={month} className="flex flex-col items-center flex-1 h-full">
                        <div className="flex items-end h-full gap-1">
                            <div className="w-3 md:w-4 bg-emerald-300 rounded-t-md hover:bg-emerald-400 transition-colors" style={{ height: `${incomeHeight}%` }} title={`Pemasukan: ${formatCurrency(income)}`}></div>
                            <div className="w-3 md:w-4 bg-red-300 rounded-t-md hover:bg-red-400 transition-colors" style={{ height: `${expenseHeight}%` }} title={`Pengeluaran: ${formatCurrency(expense)}`}></div>
                        </div>
                        <span className="text-xs text-slate-500 mt-2">{month}</span>
                    </div>
                );
            })}
        </div>
    );
};

const SmartInsights: React.FC<{ projects: Project[], transactions: Transaction[], leads: Lead[] }> = ({ projects, transactions, leads }) => {
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const generateInsights = async () => {
        setLoading(true);
        setError('');
        setInsights([]);

        try {
            // Temporarily disable AI insights due to API key issues
            // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const thisMonth = new Date().getMonth();
            const thisMonthIncome = transactions.filter(t => t.type === TransactionType.INCOME && new Date(t.date).getMonth() === thisMonth).reduce((sum, t) => sum + t.amount, 0);
            const thisMonthExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === thisMonth).reduce((sum, t) => sum + t.amount, 0);
            const newLeadsThisMonth = leads.filter(l => new Date(l.date).getMonth() === thisMonth).length;
            const convertedLeadsThisMonth = leads.filter(l => new Date(l.date).getMonth() === thisMonth && l.status === LeadStatus.CONVERTED).length;
            const ongoingProjects = projects.filter(p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.CANCELLED).length;
            const upcomingProjects = projects.filter(p => new Date(p.date) > new Date()).slice(0, 3).map(p => p.projectName);

            const prompt = `
                Based on the following JSON data for a wedding photography business this month, provide 2 concise, actionable insights in Indonesian.
                Data:
                {
                    "income": ${thisMonthIncome},
                    "expenses": ${thisMonthExpenses},
                    "new_leads": ${newLeadsThisMonth},
                    "converted_leads": ${convertedLeadsThisMonth},
                    "ongoing_projects": ${ongoingProjects},
                    "upcoming_project_names": ${JSON.stringify(upcomingProjects)}
                }
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'A short, catchy title for the insight.' },
                        suggestion: { type: Type.STRING, description: 'A one-sentence actionable suggestion.' },
                        icon: { type: Type.STRING, description: "The most relevant icon name from this list: 'dollar', 'user', 'project', 'conversion'." }
                    }
                }
            };

            // Temporary static insights while API key is being configured
            const staticInsights = [
                {
                    icon: 'dollar',
                    title: 'Peningkatan Pendapatan',
                    suggestion: `Pendapatan bulan ini ${formatCurrency(thisMonthIncome)}. ${thisMonthIncome > 0 ? 'Pertahankan momentum yang baik!' : 'Saatnya fokus pada promosi paket unggulan.'}`
                },
                {
                    icon: 'user',
                    title: 'Manajemen Prospek',
                    suggestion: `${newLeadsThisMonth} prospek baru bulan ini. ${convertedLeadsThisMonth > 0 ? `${convertedLeadsThisMonth} sudah dikonversi, lanjutkan follow-up dengan sisanya.` : 'Segera follow-up untuk meningkatkan konversi.'}`
                }
            ];
            setInsights(staticInsights);

        } catch (e) {
            console.error(e);
            setError("Gagal memuat wawasan AI.");
            setInsights([
                {icon: 'dollar', title: 'Fokus pada Penjualan', suggestion: 'Tingkatkan promosi paket Gold yang memiliki margin keuntungan tertinggi bulan ini.'},
                {icon: 'user', title: 'Kejar Prospek Baru', suggestion: 'Ada beberapa prospek baru, segera hubungi mereka untuk meningkatkan konversi.'}
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateInsights();
    }, []);

    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'dollar': return <DollarSignIcon className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0"/>;
            case 'user': return <UsersIcon className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0"/>;
            case 'project': return <FolderKanbanIcon className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0"/>;
            case 'conversion': return <TargetIcon className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0"/>;
            default: return <LightbulbIcon className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0"/>
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 inline-flex items-center gap-2"><LightbulbIcon className="w-5 h-5 text-yellow-500"/> Wawasan Cerdas</h3>
                <button onClick={generateInsights} disabled={loading} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full disabled:opacity-50" aria-label="Refresh insights">
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </button>
            </div>
            <div className="space-y-3 min-h-[100px]">
                {loading && <p className="text-sm text-center text-slate-500 py-4">Menganalisis data...</p>}
                {error && <p className="text-sm text-center text-red-500 py-4">{error}</p>}
                {!loading && insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                        {getIcon(insight.icon)}
                        <div>
                            <p className="font-medium text-slate-800">{insight.title}</p>
                            <p className="text-xs text-slate-500">{insight.suggestion}</p>
                        </div>
                    </div>
                ))}
                {!loading && !error && insights.length === 0 && <p className="text-sm text-center text-slate-500 py-4">Tidak ada wawasan baru saat ini.</p>}
            </div>
        </div>
    );
};

const LeadFunnel: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const funnelData = useMemo(() => {
        const now = new Date();
        const thisMonthLeads = leads.filter(l => {
            const leadDate = new Date(l.date);
            return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
        });

        const totalLeads = thisMonthLeads.length;
        const converted = thisMonthLeads.filter(l => l.status === LeadStatus.CONVERTED).length;
        const potentialLeads = thisMonthLeads.filter(l => l.status !== LeadStatus.REJECTED).length;

        const conversionRate = potentialLeads > 0 ? (converted / potentialLeads) * 100 : 0;

        const stages = [
            { name: "Prospek Baru", count: thisMonthLeads.filter(l => l.status === LeadStatus.NEW || l.status === LeadStatus.DISCUSSION || l.status === LeadStatus.FOLLOW_UP).length },
            { name: "Dikonversi", count: converted }
        ];

        return { conversionRate, stages, totalLeads };
    }, [leads]);

    if (funnelData.totalLeads === 0) {
        return (
             <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Corong Prospek (Bulan Ini)</h3>
                <p className="text-sm text-center text-slate-500 py-4">Belum ada prospek baru bulan ini.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Corong Prospek (Bulan Ini)</h3>
            <p className="text-slate-500 text-sm mb-4">
                Tingkat Konversi: <span className="font-bold text-emerald-600">{funnelData.conversionRate.toFixed(0)}%</span>
            </p>
            <div className="space-y-2">
                {funnelData.stages.map((stage) => (
                    <div key={stage.name} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-slate-600 truncate">{stage.name}</div>
                        <div className="flex-1 flex items-center">
                             <div className="h-5 bg-blue-200 rounded-r-md" style={{ width: `${(stage.count / (funnelData.totalLeads || 1)) * 100}%`, transition: 'width 0.5s' }}></div>
                             <span className="text-xs font-semibold text-slate-700 ml-2">{stage.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="text-center text-slate-500 py-8">Tidak ada data proyek aktif.</div>;
    }

    let accumulatedPercentage = 0;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9154943092" fill="#fff" />
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const element = (
                            <circle
                                key={index}
                                cx="18" cy="18" r="15.9154943092"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="3.8"
                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                strokeDashoffset={-accumulatedPercentage}
                                transform="rotate(-90 18 18)"
                            />
                        );
                        accumulatedPercentage += percentage;
                        return element;
                    })}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center text-center">
                    <span className="text-2xl font-bold text-slate-700">{total}</span>
                </div>
            </div>
            <div className="text-xs space-y-1 w-full">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate">{item.label}: <span className="font-semibold">{item.value}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const ProjectStatusDistribution: React.FC<{ projects: Project[] }> = ({ projects }) => {
    const statusData = useMemo(() => {
        const activeProjects = projects.filter(p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.CANCELLED);

        const statusCounts = activeProjects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<ProjectStatus, number>);

        const getStatusColor = (status: ProjectStatus) => {
            const colorMap: Record<ProjectStatus, string> = {
                [ProjectStatus.PENDING]: '#eab308',
                [ProjectStatus.PREPARATION]: '#64748b',
                [ProjectStatus.CONFIRMED]: '#3b82f6',
                [ProjectStatus.EDITING]: '#8b5cf6',
                [ProjectStatus.PRINTING]: '#f97316',
                [ProjectStatus.COMPLETED]: '#10b981',
                [ProjectStatus.CANCELLED]: '#ef4444',
            };
            return colorMap[status] || '#9ca3af';
        };

        return Object.entries(statusCounts)
            .map(([label, value]) => ({
                label: label as ProjectStatus,
                value,
                color: getStatusColor(label as ProjectStatus)
            }))
            .sort((a,b) => b.value - a.value);

    }, [projects]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribusi Proyek Aktif</h3>
            <DonutChart data={statusData} />
        </div>
    );
}

interface DashboardProps {
    clients: Client[];
    projects: Project[];
    teamMembers: any[];
    transactions: Transaction[];
    pockets: FinancialPocket[];
    leads: Lead[];
    profile: any;
    onNavigate: (action: NavigationAction) => void;
    setCurrentView: (view: ViewType) => void;
    showNotification: (message: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, projects, teamMembers, transactions, pockets, leads, profile, onNavigate, setCurrentView, showNotification }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const getMonthYear = (dateStr: string) => {
            const date = new Date(dateStr);
            return { month: date.getMonth(), year: date.getFullYear() };
        };

        const thisMonthIncome = transactions
            .filter(t => t.type === TransactionType.INCOME && getMonthYear(t.date).month === thisMonth && getMonthYear(t.date).year === thisYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthIncome = transactions
            .filter(t => t.type === TransactionType.INCOME && getMonthYear(t.date).month === lastMonth && getMonthYear(t.date).year === lastMonthYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const thisMonthNewClients = clients
            .filter(c => getMonthYear(c.since).month === thisMonth && getMonthYear(c.since).year === thisYear).length;

        const lastMonthNewClients = clients
            .filter(c => getMonthYear(c.since).month === lastMonth && getMonthYear(c.since).year === lastMonthYear).length;

        const ongoingProjects = projects.filter(p => ![ProjectStatus.COMPLETED, ProjectStatus.CANCELLED].includes(p.status)).length;

        const incomeChange = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : thisMonthIncome > 0 ? 100 : 0;
        const clientChange = lastMonthNewClients > 0 ? ((thisMonthNewClients - lastMonthNewClients) / lastMonthNewClients) * 100 : thisMonthNewClients > 0 ? 100 : 0;

        const upcomingProjects = projects.filter(p => new Date(p.date) >= now && ![ProjectStatus.COMPLETED, ProjectStatus.CANCELLED].includes(p.status)).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

        const unpaidInvoices = projects.filter(p => p.paymentStatus !== 'Lunas' && p.status !== ProjectStatus.CANCELLED).length;

        return {
            thisMonthIncome,
            incomeChange,
            thisMonthNewClients,
            clientChange,
            ongoingProjects,
            upcomingProjects,
            unpaidInvoices
        };
    }, [transactions, clients, projects]);

    const cashFlowData = useMemo(() => {
        const data: { [key: string]: { income: number, expense: number } } = {};
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleString('id-ID', { month: 'short' });
            data[monthName] = { income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            const date = new Date(t.date);
            const currentYear = now.getFullYear();
            const monthDiff = (currentYear - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
            if (monthDiff >= 0 && monthDiff < 6) {
                const monthName = date.toLocaleString('id-ID', { month: 'short' });
                if (data[monthName]) {
                    if (t.type === TransactionType.INCOME) {
                        data[monthName].income += t.amount;
                    } else {
                        data[monthName].expense += t.amount;
                    }
                }
            }
        });

        return Object.entries(data).map(([month, values]) => ({ month, ...values }));
    }, [transactions]);

    const financialGoalProgress = useMemo(() => {
        const savingPockets = pockets.filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED);
        if (savingPockets.length === 0) return null;

        const totalSaved = savingPockets.reduce((sum, p) => sum + p.amount, 0);
        const totalGoal = savingPockets.reduce((sum, p) => sum + (p.goalAmount || p.amount), 0);
        if (totalGoal === 0) return null;

        const progress = (totalSaved / totalGoal) * 100;

        return {
            pocket: savingPockets[0],
            totalSaved,
            totalGoal,
            progress,
        };
    }, [pockets]);


    const [aiInsights, setAiInsights] = useState('');

    const generateInsights = async () => {
        try {
          // Temporary static insights while fixing API key issue
          const staticInsights = `Berdasarkan data keuangan Anda, bisnis menunjukkan performa yang baik dengan ${stats.ongoingProjects} proyek dan ${clients.length} klien. Untuk meningkatkan profitabilitas, fokuskan pada retensi klien dan optimalisasi biaya operasional. Pertimbangkan untuk mengembangkan paket layanan premium untuk meningkatkan rata-rata nilai transaksi.`;

          setAiInsights(staticInsights);
        } catch (error) {
          console.error('Error generating insights:', error);
          setAiInsights('Fitur analisis AI sedang dalam perbaikan. Silakan coba lagi nanti.');
        }
      };

      useEffect(() => {
        generateInsights();
      }, [stats, clients]);


    return (
        <div>
            <PageHeader title="Dashboard" subtitle="Selamat datang kembali, Admin!" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<DollarSignIcon className="w-6 h-6 text-emerald-500" />} title="Pendapatan Bulan Ini" value={formatCurrency(stats.thisMonthIncome)} change={`${stats.incomeChange >= 0 ? '+' : ''}${stats.incomeChange.toFixed(0)}%`} changeType={stats.incomeChange >= 0 ? 'increase' : 'decrease'} />
                <StatCard icon={<UsersIcon className="w-6 h-6 text-blue-500" />} title="Klien Baru Bulan Ini" value={stats.thisMonthNewClients.toString()} change={`${stats.clientChange >= 0 ? '+' : ''}${stats.clientChange.toFixed(0)}%`} changeType={stats.clientChange >= 0 ? 'increase' : 'decrease'} />
                <StatCard icon={<FolderKanbanIcon className="w-6 h-6 text-purple-500" />} title="Proyek Aktif" value={stats.ongoingProjects.toString()} />
                <StatCard icon={<AlertCircleIcon className="w-6 h-6 text-red-500" />} title="Invoice Belum Lunas" value={stats.unpaidInvoices.toString()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Arus Kas (6 Bulan Terakhir)</h3>
                    <CashFlowChart data={cashFlowData} />
                </div>
                <div className="space-y-6">
                    <SmartInsights projects={projects} transactions={transactions} leads={leads} />
                    <LeadFunnel leads={leads} />
                     {aiInsights && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Wawasan AI</h3>
                            <p className="text-sm text-slate-700">{aiInsights}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Proyek Mendatang</h3>
                    <div className="space-y-3">
                        {stats.upcomingProjects.length > 0 ? stats.upcomingProjects.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-800 truncate">{p.projectName}</p>
                                    <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})} &bull; {p.location}</p>
                                </div>
                                <button onClick={() => onNavigate({ type: 'VIEW_PROJECT_DETAILS', id: p.id })} className="text-xs font-semibold text-blue-600 hover:underline flex-shrink-0 ml-2">Lihat</button>
                            </div>
                        )) : <p className="text-sm text-center text-slate-500 py-4">Tidak ada proyek dalam waktu dekat.</p>}
                    </div>
                </div>

                <ProjectStatusDistribution projects={projects} />

                <div className="space-y-6">
                    {financialGoalProgress && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-3">Tujuan Keuangan Teratas</h3>
                            <div className="flex items-center gap-4">
                                <PiggyBankIcon className="w-8 h-8 text-pink-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold truncate">{financialGoalProgress.pocket.name}</p>
                                    <p className="text-sm text-slate-500">Tercapai {financialGoalProgress.progress.toFixed(0)}%</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 my-3">
                                <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${financialGoalProgress.progress}%` }}></div>
                            </div>
                            <div className="text-sm flex flex-col sm:flex-row justify-between">
                                <span className="text-slate-600">Terkumpul: {formatCurrency(financialGoalProgress.totalSaved)}</span>
                                <span className="text-slate-500">Target: {formatCurrency(financialGoalProgress.totalGoal)}</span>
                            </div>
                        </div>
                    )}
                     <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Pengingat</h3>
                        <div className="space-y-3">
                             <div className="flex items-start gap-3">
                                <CalendarIcon className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0"/>
                                <div>
                                    <p className="font-medium text-slate-800">{stats.upcomingProjects.length} Proyek Mendatang</p>
                                    <p className="text-xs text-slate-500">Jangan lupa mempersiapkan semua kebutuhan.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <StarIcon className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0"/>
                                <div>
                                    <p className="font-medium text-slate-800">Review Klien</p>
                                    <p className="text-xs text-slate-500">Minta ulasan dari proyek yang baru saja selesai.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;