



import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, PaymentStatus, TeamMember, AssignedTeamMember, Profile } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, getProjectStatusColor } from '../constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.LUNAS: return 'bg-emerald-100 text-emerald-800';
        case PaymentStatus.DP_TERBAYAR: return 'bg-blue-100 text-blue-800';
        case PaymentStatus.BELUM_BAYAR: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const initialEventState = {
    projectName: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    projectType: '',
    status: ProjectStatus.CONFIRMED,
    team: '',
    notes: '',
};

interface CalendarViewProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    teamMembers: TeamMember[];
    profile: Profile;
}

const CalendarView: React.FC<CalendarViewProps> = ({ projects, setProjects, teamMembers, profile }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [newEventData, setNewEventData] = useState({...initialEventState, projectType: profile.eventTypes[0] || ''});

    const projectsByDate = useMemo(() => {
        const map = new Map<string, Project[]>();
        projects.forEach(project => {
            const dateKey = project.date; // Format YYYY-MM-DD
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push(project);
        });
        return map;
    }, [projects]);

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const days = [];
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

        // Days from previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            const day = new Date(year, month, i - startDayOfWeek + 1);
            days.push({ date: day, isCurrentMonth: false });
        }

        // Days of current month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const day = new Date(year, month, i);
            days.push({ date: day, isCurrentMonth: true });
        }

        // Days from next month
        const endDayOfWeek = lastDayOfMonth.getDay();
        for (let i = 1; i < 7 - endDayOfWeek; i++) {
            const day = new Date(year, month + 1, i);
            days.push({ date: day, isCurrentMonth: false });
        }
        
        return days;
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleGoToToday = () => {
        setCurrentDate(new Date());
    };

    const handleOpenModal = (project: Project) => {
        setSelectedProject(project);
    };
    
    const handleCloseModal = () => {
        setSelectedProject(null);
    }

    const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewEventData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEvent = (e: React.FormEvent) => {
        e.preventDefault();
        const foundTeamMembers = newEventData.team
            .split(',')
            .map(name => name.trim())
            .filter(name => name)
            .map(name => teamMembers.find(member => member.name.toLowerCase() === name.toLowerCase()))
            .filter((member): member is TeamMember => !!member);
        
        const assignedTeamForProject: AssignedTeamMember[] = foundTeamMembers.map(member => ({
            memberId: member.id,
            name: member.name,
            role: member.role,
            fee: member.standardFee,
        }));

        const newProject: Project = {
            id: `PRJ-EVT-${Date.now()}`,
            projectName: newEventData.projectName,
            clientName: 'Acara Internal',
            clientId: '',
            projectType: newEventData.projectType,
            packageName: newEventData.projectType,
            packageId: '',
            addOns: [],
            date: newEventData.date,
            location: newEventData.location,
            progress: 0,
            status: newEventData.status,
            totalCost: 0,
            amountPaid: 0,
            paymentStatus: PaymentStatus.LUNAS,
            team: assignedTeamForProject,
            notes: newEventData.notes,
            startTime: newEventData.startTime,
            endTime: newEventData.endTime,
        };

        setProjects(prev => [...prev, newProject].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsAddEventModalOpen(false);
        setNewEventData({...initialEventState, projectType: profile.eventTypes[0] || ''});
    };
    
    const today = new Date();
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    return (
        <div>
            <PageHeader title="Kalender" subtitle="Lihat jadwal proyek dan acara Anda secara visual." />
            
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                     <div className="flex items-center gap-2">
                        <button onClick={handleGoToToday} className="px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Hari Ini</button>
                        <button onClick={handlePrevMonth} className="p-2 text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                        <button onClick={handleNextMonth} className="p-2 text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50"><ChevronRightIcon className="w-5 h-5"/></button>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-800 text-center order-first w-full sm:w-auto sm:order-none">
                        {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => setIsAddEventModalOpen(true)} className="button-primary">
                        <PlusIcon className="w-4 h-4 mr-2"/> Tambah Acara Baru
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-slate-600 bg-slate-200 border-l border-t border-slate-200">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                        <div key={day} className="py-2 bg-slate-50">{day}</div>
                    ))}
                    {calendarGrid.map(({ date, isCurrentMonth }, index) => {
                         const dateKey = date.toISOString().split('T')[0];
                         const dayProjects = projectsByDate.get(dateKey) || [];
                         const isToday = isSameDay(date, today);

                         return (
                            <div key={index} className={`relative min-h-[120px] p-2 bg-white ${isCurrentMonth ? '' : 'bg-slate-50 text-slate-400'}`}>
                                <span className={`absolute top-2 left-2 flex items-center justify-center h-7 w-7 text-sm rounded-full ${isToday ? 'bg-slate-800 text-white font-bold' : ''}`}>
                                    {date.getDate()}
                                </span>
                                <div className="mt-9 space-y-1">
                                    {dayProjects.map(project => (
                                        <button 
                                            key={project.id} 
                                            onClick={() => handleOpenModal(project)}
                                            className="w-full text-left p-1.5 rounded-md text-white text-xs font-medium truncate hover:opacity-80 transition-opacity"
                                            style={{ backgroundColor: getProjectStatusColor(project.status) }}
                                        >
                                           <div className={`w-2 h-2 rounded-full inline-block mr-1`} style={{ backgroundColor: getProjectStatusColor(project.status) }}></div>
                                           {project.startTime && `${project.startTime} `}{project.projectName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                         )
                    })}
                </div>
            </div>
            {selectedProject && (
                <Modal 
                    isOpen={!!selectedProject} 
                    onClose={handleCloseModal} 
                    title={`Detail Proyek: ${selectedProject.projectName}`}
                    size="lg"
                >
                    <div className="space-y-4 text-sm">
                        <p><strong>Klien:</strong> {selectedProject.clientName}</p>
                        <p><strong>Tanggal & Lokasi:</strong> {new Date(selectedProject.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} di {selectedProject.location}</p>
                         {selectedProject.startTime && <p><strong>Waktu:</strong> {selectedProject.startTime} - {selectedProject.endTime}</p>}
                        <p><strong>Paket:</strong> {selectedProject.packageName}</p>
                        {selectedProject.addOns.length > 0 && <p><strong>Add-ons:</strong> {selectedProject.addOns.map(a => a.name).join(', ')}</p>}
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t">
                           <div>
                                <p className="text-slate-500">Total Biaya</p>
                                <p className="font-semibold text-base">{formatCurrency(selectedProject.totalCost)}</p>
                           </div>
                            <div>
                                <p className="text-slate-500">Status Proyek</p>
                                <p className={`font-semibold text-base capitalize`} style={{ color: getProjectStatusColor(selectedProject.status) }}>{selectedProject.status}</p>
                           </div>
                           <div>
                                <p className="text-slate-500">Telah Dibayar</p>
                                <p className="font-semibold text-emerald-600 text-base">{formatCurrency(selectedProject.amountPaid)}</p>
                           </div>
                           <div>
                                <p className="text-slate-500">Sisa Pembayaran</p>
                                <p className="font-semibold text-red-600 text-base">{formatCurrency(selectedProject.totalCost - selectedProject.amountPaid)}</p>
                           </div>
                        </div>
                         <div className="pt-4 mt-4 border-t">
                            <p className="text-slate-500">Tim yang Bertugas</p>
                            <p className="font-medium">{selectedProject.team.length > 0 ? selectedProject.team.map(t => `${t.name} (${t.role})`).join(', ') : 'Belum ada tim yang ditugaskan'}</p>
                         </div>
                    </div>
                </Modal>
            )}
            
            <Modal
                isOpen={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
                title="Tambah Acara Baru"
                size="lg"
            >
                <form onSubmit={handleSaveEvent} className="space-y-4">
                    <p className="text-sm text-slate-500">Masukkan informasi acara baru di bawah ini.</p>
                    <div>
                        <label className="input-label">Judul Acara</label>
                        <input type="text" name="projectName" value={newEventData.projectName} onChange={handleNewEventChange} className="input-field" required/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">Tanggal</label>
                            <input type="date" name="date" value={newEventData.date} onChange={handleNewEventChange} className="input-field" required/>
                        </div>
                        <div>
                            <label className="input-label">Waktu Mulai</label>
                            <input type="time" name="startTime" value={newEventData.startTime} onChange={handleNewEventChange} className="input-field" required/>
                        </div>
                        <div>
                            <label className="input-label">Waktu Selesai</label>
                            <input type="time" name="endTime" value={newEventData.endTime} onChange={handleNewEventChange} className="input-field" required/>
                        </div>
                    </div>
                     <div>
                        <label className="input-label">Lokasi</label>
                        <input type="text" name="location" value={newEventData.location} onChange={handleNewEventChange} className="input-field"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Jenis Acara</label>
                            <select name="projectType" value={newEventData.projectType} onChange={handleNewEventChange} className="input-field" required>
                                {(profile.eventTypes || []).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="input-label">Status</label>
                            <select name="status" value={newEventData.status} onChange={handleNewEventChange} className="input-field">
                                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="input-label">Tim (pisahkan dengan koma)</label>
                        <input type="text" name="team" placeholder="e.g., Bambang Sudiro, Siti Aminah" value={newEventData.team} onChange={handleNewEventChange} className="input-field"/>
                    </div>
                     <div>
                        <label className="input-label">Deskripsi</label>
                        <textarea name="notes" value={newEventData.notes} onChange={handleNewEventChange} className="input-field" rows={3}></textarea>
                    </div>
                    <div className="pt-4 border-t text-right space-x-2">
                        <button type="button" onClick={() => setIsAddEventModalOpen(false)} className="button-secondary">Batal</button>
                        <button type="submit" className="button-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
             <style>{`
                  .input-label { display: block; text-sm; font-medium; color: #475569; margin-bottom: 0.25rem; }
                  .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
                  .input-field:focus { outline: none; border-color: #475569; box-shadow: 0 0 0 1px #475569; }
            `}</style>
        </div>
    );
};

export default CalendarView;