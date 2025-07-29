import React, { useState, useEffect } from 'react';
import { Profile, Transaction, Project } from '../types';
import PageHeader from './PageHeader';
import { PencilIcon, PlusIcon, Trash2Icon } from '../constants';

// Helper Component for Toggle Switches
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; }> = ({ enabled, onChange }) => (
    <button
      type="button"
      className={`${enabled ? 'bg-slate-800' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2`}
      onClick={onChange}
    >
      <span
        className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );

interface SettingsProps {
    profile: Profile;
    updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
    transactions: Transaction[];
    projects: Project[];
}

const Settings: React.FC<SettingsProps> = ({ profile, updateProfile, transactions, projects }) => {
    const [localProfile, setLocalProfile] = useState<Profile>(profile);

    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);
    const [activeTab, setActiveTab] = useState('profile');
    const [showSuccess, setShowSuccess] = useState(false);

    // State for category management
    const [incomeCategoryInput, setIncomeCategoryInput] = useState('');
    const [editingIncomeCategory, setEditingIncomeCategory] = useState<string | null>(null);
    const [expenseCategoryInput, setExpenseCategoryInput] = useState('');
    const [editingExpenseCategory, setEditingExpenseCategory] = useState<string | null>(null);
    const [projectTypeInput, setProjectTypeInput] = useState('');
    const [editingProjectType, setEditingProjectType] = useState<string | null>(null);
    const [eventTypeInput, setEventTypeInput] = useState('');
    const [editingEventType, setEditingEventType] = useState<string | null>(null);

    // State for security tab
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(localProfile);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Gagal menyimpan perubahan. Silakan coba lagi.');
        }
    }

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            alert("Konfirmasi kata sandi baru tidak cocok.");
            return;
        }
        if (passwordData.new.length < 8) {
            alert("Kata sandi baru harus minimal 8 karakter.");
            return;
        }
        alert("Kata sandi berhasil diubah! (Simulasi)");
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    // --- Category Management Handlers ---

    // Income
    const handleAddOrUpdateIncomeCategory = async () => {
        if (!incomeCategoryInput.trim()) return;
        const newCategory = incomeCategoryInput.trim();
        const categories = profile.incomeCategories || [];

        if (editingIncomeCategory) { // Update
            if (newCategory !== editingIncomeCategory && categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                incomeCategories: (localProfile.incomeCategories || []).map(c => c === editingIncomeCategory ? newCategory : c).sort()
            };
            
            await updateProfile(updatedProfile);
            setEditingIncomeCategory(null);
        } else { // Add
            if (categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                incomeCategories: [...categories, newCategory].sort()
            };
            
            await updateProfile(updatedProfile);
        }
        setIncomeCategoryInput('');
    };

    const handleEditIncomeCategory = (category: string) => {
        setEditingIncomeCategory(category);
        setIncomeCategoryInput(category);
    };

    const handleDeleteIncomeCategory = async (category: string) => {
        // Check if category is in use
        const isCategoryInUse = transactions.some(t => t.category === category && t.type === 'Pemasukan');
        if (isCategoryInUse) {
            alert(`Kategori "${category}" tidak dapat dihapus karena sedang digunakan dalam transaksi. Harap ubah kategori transaksi tersebut terlebih dahulu.`);
            return;
        }

        if (window.confirm(`Yakin ingin menghapus kategori "${category}"?`)) {
            const updatedProfile = {
                ...localProfile,
                incomeCategories: (localProfile.incomeCategories || []).filter(c => c !== category)
            };
           
            await updateProfile(updatedProfile);
        }
    };

    // Expense
    const handleAddOrUpdateExpenseCategory = async () => {
        if (!expenseCategoryInput.trim()) return;
        const newCategory = expenseCategoryInput.trim();
        const categories = profile.expenseCategories || [];

        if (editingExpenseCategory) { // Update
            if (newCategory !== editingExpenseCategory && categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                expenseCategories: categories.map(c => c === editingExpenseCategory ? newCategory : c).sort()
            };
            
            await updateProfile(updatedProfile);
            setEditingExpenseCategory(null);
        } else { // Add
            if (categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                expenseCategories: [...categories, newCategory].sort()
            };
            
            await updateProfile(updatedProfile);
        }
        setExpenseCategoryInput('');
    };

    const handleEditExpenseCategory = (category: string) => {
        setEditingExpenseCategory(category);
        setExpenseCategoryInput(category);
    };

    const handleDeleteExpenseCategory = async (category: string) => {
        // Check if category is in use
        const isCategoryInUse = transactions.some(t => t.category === category && t.type === 'Pengeluaran');
        if (isCategoryInUse) {
            alert(`Kategori "${category}" tidak dapat dihapus karena sedang digunakan dalam transaksi. Harap ubah kategori transaksi tersebut terlebih dahulu.`);
            return;
        }

        if (window.confirm(`Yakin ingin menghapus kategori "${category}"?`)) {
            const updatedProfile = {
                ...localProfile,
                expenseCategories: (localProfile.expenseCategories || []).filter(c => c !== category)
            };
            
            await updateProfile(updatedProfile);
        }
    };

    // Project Type
    const handleAddOrUpdateProjectType = async () => {
        if (!projectTypeInput.trim()) return;
        const newType = projectTypeInput.trim();
        const types = profile.projectTypes || [];

        if (editingProjectType) { // Update
            if (newType !== editingProjectType && types.includes(newType)) {
                alert('Jenis proyek ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                projectTypes: types.map(t => t === editingProjectType ? newType : t).sort()
            };
           
            await updateProfile(updatedProfile);
            setEditingProjectType(null);
        } else { // Add
            if (types.includes(newType)) {
                alert('Jenis proyek ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                projectTypes: [...types, newType].sort()
            };
            
            await updateProfile(updatedProfile);
        }
        setProjectTypeInput('');
    };

    const handleEditProjectType = (type: string) => {
        setEditingProjectType(type);
        setProjectTypeInput(type);
    };

    const handleDeleteProjectType = async (type: string) => {
        // Check if project type is in use
        const isTypeInUse = projects.some(p => p.projectType === type);
        if (isTypeInUse) {
            alert(`Jenis proyek "${type}" tidak dapat dihapus karena sedang digunakan. Harap ubah jenis proyek pada proyek yang ada terlebih dahulu.`);
            return;
        }

        if (window.confirm(`Yakin ingin menghapus jenis proyek "${type}"?`)) {
            const updatedProfile = {
                ...localProfile,
                projectTypes: (localProfile.projectTypes || []).filter(t => t !== type)
            };
            
            await updateProfile(updatedProfile);
        }
    };

    // Event Type
    const handleAddOrUpdateEventType = async () => {
        if (!eventTypeInput.trim()) return;
        const newType = eventTypeInput.trim();
        const types = profile.eventTypes || [];

        if (editingEventType) { // Update
            if (newType !== editingEventType && types.includes(newType)) {
                alert('Jenis acara ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                eventTypes: types.map(t => t === editingEventType ? newType : t).sort()
            };
            
            await updateProfile(updatedProfile);
            setEditingEventType(null);
        } else { // Add
            if (types.includes(newType)) {
                alert('Jenis acara ini sudah ada.');
                return;
            }
            const updatedProfile = {
                ...localProfile,
                eventTypes: [...types, newType].sort()
            };
            
            await updateProfile(updatedProfile);
        }
        setEventTypeInput('');
    };

    const handleEditEventType = (type: string) => {
        setEditingEventType(type);
        setEventTypeInput(type);
    };

    const handleDeleteEventType = async (type: string) => {
        // Check if event type is in use by an internal event
        const isTypeInUse = projects.some(p => p.clientName === 'Acara Internal' && p.projectType === type);
        if (isTypeInUse) {
            alert(`Jenis acara "${type}" tidak dapat dihapus karena sedang digunakan di kalender. Harap ubah jenis acara tersebut terlebih dahulu.`);
            return;
        }

        if (window.confirm(`Yakin ingin menghapus jenis acara "${type}"?`)) {
            const updatedProfile = {
                ...localProfile,
                eventTypes: (localProfile.eventTypes || []).filter(t => t !== type)
            };
            
            await updateProfile(updatedProfile);
        }
    };

    const handleCategoryInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, handler: () => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handler();
        }
    };

    // Render function for category list item
    const renderCategoryItem = (
        category: string,
        onEdit: (cat: string) => void,
        onDelete: (cat: string) => void
    ) => (
        <div key={category} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md">
            <span className="text-sm text-slate-800">{category}</span>
            <div className="flex items-center space-x-2">
                <button type="button" onClick={() => onEdit(category)} className="p-1 text-slate-500 hover:text-blue-600" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => onDelete(category)} className="p-1 text-slate-500 hover:text-red-600" title="Hapus"><Trash2Icon className="w-4 h-4" /></button>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch(activeTab) {
            case 'profile':
                 return (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                                <input type="text" name="fullName" value={localProfile.fullName || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                <input type="email" name="email" value={localProfile.email || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Telepon</label>
                                <input type="text" name="phone" value={localProfile.phone || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nama Perusahaan</label>
                                <input type="text" name="companyName" value={localProfile.companyName || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Website</label>
                                <input type="url" name="website" value={localProfile.website || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Alamat</label>
                                <input type="text" name="address" value={localProfile.address || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Rekening Perusahaan</label>
                                <input type="text" name="bankAccount" placeholder="e.g., BCA 1234567890 a/n Perusahaan Anda" value={localProfile.bankAccount || ''} onChange={handleInputChange} className="mt-1 input-field" />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Bio</label>
                                <textarea name="bio" rows={3} value={localProfile.bio || ''} onChange={handleInputChange} className="mt-1 input-field"></textarea>
                            </div>
                        </div>
                        <div className="text-right flex items-center justify-end pt-4 border-t">
                            {showSuccess && <span className="text-emerald-600 text-sm font-medium mr-4">Tersimpan!</span>}
                            <button type="submit" className="button-primary">
                                Simpan Perubahan Profil
                            </button>
                        </div>
                    </form>
                );
            case 'categories':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Project & Event Types */}
                        <div className="space-y-8">
                            {/* Project Types */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Jenis Proyek (Klien)</h3>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={projectTypeInput}
                                        onChange={(e) => setProjectTypeInput(e.target.value)}
                                        onKeyDown={(e) => handleCategoryInputKeyDown(e, handleAddOrUpdateProjectType)}
                                        className="input-field"
                                        placeholder={editingProjectType ? 'Edit jenis...' : 'Tambah jenis baru...'}
                                    />
                                    <button type="button" onClick={handleAddOrUpdateProjectType} className="button-primary p-2.5 h-10">
                                        {editingProjectType ? '✓' : <PlusIcon className="w-5 h-5"/>}
                                    </button>
                                    {editingProjectType && (
                                        <button type="button" onClick={() => { setEditingProjectType(null); setProjectTypeInput(''); }} className="button-secondary p-2.5 h-10">X</button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                                    {(localProfile.projectTypes || []).map(cat => renderCategoryItem(cat, handleEditProjectType, handleDeleteProjectType))}
                                </div>
                            </div>
                            {/* Event Types */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Jenis Acara (Internal)</h3>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={eventTypeInput}
                                        onChange={(e) => setEventTypeInput(e.target.value)}
                                        onKeyDown={(e) => handleCategoryInputKeyDown(e, handleAddOrUpdateEventType)}
                                        className="input-field"
                                        placeholder={editingEventType ? 'Edit jenis...' : 'Tambah jenis baru...'}
                                    />
                                    <button type="button" onClick={handleAddOrUpdateEventType} className="button-primary p-2.5 h-10">
                                        {editingEventType ? '✓' : <PlusIcon className="w-5 h-5"/>}
                                    </button>
                                    {editingEventType && (
                                        <button type="button" onClick={() => { setEditingEventType(null); setEventTypeInput(''); }} className="button-secondary p-2.5 h-10">X</button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                                    {(localProfile.eventTypes || []).map(cat => renderCategoryItem(cat, handleEditEventType, handleDeleteEventType))}
                                </div>
                            </div>
                        </div>
                        {/* Financial Categories */}
                        <div className="space-y-8">
                            {/* Income Categories */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Kategori Pemasukan</h3>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={incomeCategoryInput}
                                        onChange={(e) => setIncomeCategoryInput(e.target.value)}
                                        onKeyDown={(e) => handleCategoryInputKeyDown(e, handleAddOrUpdateIncomeCategory)}
                                        className="input-field"
                                        placeholder={editingIncomeCategory ? 'Edit kategori...' : 'Tambah kategori baru...'}
                                    />
                                    <button type="button" onClick={handleAddOrUpdateIncomeCategory} className="button-primary p-2.5 h-10">
                                        {editingIncomeCategory ? '✓' : <PlusIcon className="w-5 h-5"/>}
                                    </button>
                                    {editingIncomeCategory && (
                                        <button type="button" onClick={() => { setEditingIncomeCategory(null); setIncomeCategoryInput(''); }} className="button-secondary p-2.5 h-10">X</button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                                    {(localProfile.incomeCategories || []).map(cat => renderCategoryItem(cat, handleEditIncomeCategory, handleDeleteIncomeCategory))}
                                </div>
                            </div>
                            {/* Expense Categories */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Kategori Pengeluaran</h3>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={expenseCategoryInput}
                                        onChange={(e) => setExpenseCategoryInput(e.target.value)}
                                        onKeyDown={(e) => handleCategoryInputKeyDown(e, handleAddOrUpdateExpenseCategory)}
                                        className="input-field"
                                        placeholder={editingExpenseCategory ? 'Edit kategori...' : 'Tambah kategori baru...'}
                                    />
                                    <button type="button" onClick={handleAddOrUpdateExpenseCategory} className="button-primary p-2.5 h-10">
                                        {editingExpenseCategory ? '✓' : <PlusIcon className="w-5 h-5"/>}
                                    </button>
                                    {editingExpenseCategory && (
                                        <button type="button" onClick={() => { setEditingExpenseCategory(null); setExpenseCategoryInput(''); }} className="button-secondary p-2.5 h-10">X</button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                                    {(localProfile.expenseCategories || []).map(cat => renderCategoryItem(cat, handleEditExpenseCategory, handleDeleteExpenseCategory))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                 return (
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Notifikasi Email</h3>
                        <p className="text-sm text-slate-500 mb-6">Pilih notifikasi mana yang ingin Anda terima melalui email.</p>
                        <div className="space-y-5 divide-y divide-slate-200">
                           <div className="flex items-center justify-between pt-5 first:pt-0">
                                <div>
                                    <h4 className="font-medium text-slate-800">Proyek Baru</h4>
                                    <p className="text-sm text-slate-500">Dapatkan email saat proyek baru ditambahkan.</p>
                                </div>
                                <ToggleSwitch enabled={localProfile.notificationSettings?.newProject || false} onChange={async () => {
                                    const updatedSettings = {
                                        ...localProfile.notificationSettings,
                                        newProject: !localProfile.notificationSettings?.newProject
                                    };
                                    
                                    await updateProfile({ notificationSettings: updatedSettings });
                                }} />
                           </div>
                           <div className="flex items-center justify-between pt-5 first:pt-0">
                                <div>
                                    <h4 className="font-medium text-slate-800">Pembayaran Lunas</h4>
                                    <p className="text-sm text-slate-500">Dapatkan email saat klien melunasi pembayaran proyek.</p>
                                </div>
                                <ToggleSwitch enabled={localProfile.notificationSettings?.paymentConfirmation || false} onChange={async () => {
                                    const updatedSettings = {
                                        ...localProfile.notificationSettings,
                                        paymentConfirmation: !localProfile.notificationSettings?.paymentConfirmation
                                    };
                                    
                                    await updateProfile({ notificationSettings: updatedSettings });
                                }} />
                           </div>
                           <div className="flex items-center justify-between pt-5 first:pt-0">
                                <div>
                                    <h4 className="font-medium text-slate-800">Deadline Mendatang</h4>
                                    <p className="text-sm text-slate-500">Dapatkan email pengingat 3 hari sebelum deadline proyek.</p>
                                </div>
                                <ToggleSwitch enabled={localProfile.notificationSettings?.deadlineReminder || false} onChange={async () => {
                                     const updatedSettings = {
                                        ...localProfile.notificationSettings,
                                        deadlineReminder: !localProfile.notificationSettings?.deadlineReminder
                                    };
                                    
                                    await updateProfile({ notificationSettings: updatedSettings });
                                }} />
                           </div>
                        </div>
                    </div>
                );
            case 'security':
                 return (
                     <div className="max-w-2xl mx-auto space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Keamanan Akun</h3>
                            <div className="space-y-5 divide-y divide-slate-200">
                                <div className="flex items-center justify-between pt-5 first:pt-0">
                                    <div>
                                        <h4 className="font-medium text-slate-800">Otentikasi Dua Faktor (2FA)</h4>
                                        <p className="text-sm text-slate-500">Tingkatkan keamanan akun Anda dengan verifikasi tambahan.</p>
                                    </div>
                                    <ToggleSwitch enabled={localProfile.securitySettings?.twoFactorEnabled || false} onChange={async () => {
                                        
                                        await updateProfile({ securitySettings: { ...profile.securitySettings, twoFactorEnabled: !profile.securitySettings?.twoFactorEnabled } });
                                    }} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Ganti Kata Sandi</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="input-label">Kata Sandi Saat Ini</label>
                                    <input type="password" value={passwordData.current} onChange={e => setPasswordData(p => ({...p, current: e.target.value}))} className="input-field" required />
                                </div>
                                <div>
                                    <label className="input-label">Kata Sandi Baru</label>
                                    <input type="password" value={passwordData.new} onChange={e => setPasswordData(p => ({...p, new: e.target.value}))} className="input-field" required minLength={8} />
                                </div>
                                <div>
                                    <label className="input-label">Konfirmasi Kata Sandi Baru</label>
                                    <input type="password" value={passwordData.confirm} onChange={e => setPasswordData(p => ({...p, confirm: e.target.value}))} className="input-field" required />
                                </div>
                                <div className="text-right pt-2">
                                    <button type="submit" className="button-primary">Ganti Kata Sandi</button>
                                </div>
                            </form>
                        </div>
                     </div>
                 );
            default:
                 return null;
        }
    }

    return (
        <div>
            <PageHeader title="Pengaturan" subtitle="Kelola informasi akun, kategori, dan preferensi aplikasi Anda." />
            <div className="bg-white rounded-xl shadow-sm">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                        <button type="button" onClick={() => setActiveTab('profile')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Profil</button>
                        <button type="button" onClick={() => setActiveTab('categories')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Kategori</button>
                        <button type="button" onClick={() => setActiveTab('notifications')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Notifikasi</button>
                        <button type="button" onClick={() => setActiveTab('security')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Keamanan</button>
                    </nav>
                </div>
                <div className="p-6">
                    {renderTabContent()}
                </div>
            </div>
             <style>{`
                .input-field {
                    width: 100%;
                    height: 2.5rem; /* 40px */
                    padding: 0.5rem 0.75rem;
                    background-color: white;
                    border: 1px solid #cbd5e1; /* slate-300 */
                    border-radius: 0.375rem; /* rounded-md */
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    color: #334155; /* slate-700 */
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                }
                textarea.input-field {
                    height: auto;
                }
                .input-field:focus {
                    outline: none;
                    border-color: #475569; /* slate-600 */
                    box-shadow: 0 0 0 1px #475569;
                }
                .input-label { display: block; text-sm; font-medium; color: #475569; margin-bottom: 0.25rem; }
            `}</style>
        </div>
    );
};

export default Settings;