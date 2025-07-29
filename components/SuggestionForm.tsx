import React, { useState } from 'react';
import { Lead, LeadStatus, ContactChannel } from '../types';

interface SuggestionFormProps {
    addLead: (lead: Lead) => void;
    showNotification: (message: string) => void;
    switchToLogin: () => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ addLead, showNotification, switchToLogin }) => {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!suggestion.trim()) {
            alert('Saran tidak boleh kosong.');
            return;
        }

        setIsLoading(true);

        const fullNotes = contact 
            ? `Kontak: ${contact}\n\nSaran:\n${suggestion}`
            : suggestion;

        const newLead: Lead = {
            id: `LEAD-SUGGEST-${Date.now()}`,
            name: name.trim() || 'Anonim',
            contactChannel: ContactChannel.SUGGESTION_FORM,
            location: 'Online',
            status: LeadStatus.NEW,
            date: new Date().toISOString().split('T')[0],
            notes: fullNotes,
        };
        
        // Simulate API call
        setTimeout(() => {
            addLead(newLead);
            setIsLoading(false);
            setIsSubmitted(true);
            showNotification('Terima kasih! Saran Anda telah kami terima.');
        }, 1000);
    };

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Terima Kasih!</h2>
                    <p className="text-slate-600">Saran dan masukan Anda sangat berharga bagi kami untuk menjadi lebih baik.</p>
                    <button type="button" onClick={switchToLogin} className="mt-4 button-primary w-full">
                        Kembali ke Halaman Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Beri Kami Masukan</h1>
                    <p className="mt-2 text-sm text-slate-500">Punya saran atau ide untuk Vena Pictures? Kami ingin mendengarnya!</p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                     <div className="rounded-md shadow-sm space-y-3">
                        <div>
                            <label htmlFor="suggestion-name" className="input-label">Nama Anda (Opsional)</label>
                            <input
                                id="suggestion-name"
                                name="name"
                                type="text"
                                className="input-field"
                                placeholder="Nama Anda"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                         <div>
                            <label htmlFor="suggestion-contact" className="input-label">Kontak (Opsional)</label>
                            <input
                                id="suggestion-contact"
                                name="contact"
                                type="text"
                                className="input-field"
                                placeholder="Email atau nomor telepon"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="suggestion-text" className="input-label">Saran atau Masukan Anda</label>
                            <textarea
                                id="suggestion-text"
                                name="suggestion"
                                rows={5}
                                required
                                className="input-field"
                                placeholder="Tuliskan ide brilian Anda di sini..."
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400"
                        >
                            {isLoading ? 'Mengirim...' : 'Kirim Saran'}
                        </button>
                    </div>
                     <p className="text-center text-sm text-slate-500">
                        Ingin masuk?{' '}
                        <button type="button" onClick={switchToLogin} className="font-medium text-slate-600 hover:text-slate-500 underline">
                            Kembali ke Halaman Login
                        </button>
                    </p>
                </form>
            </div>
             <style>{`
                .input-field {
                    appearance: none;
                    position: relative;
                    display: block;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #cbd5e1; /* slate-300 */
                    border-radius: 0.375rem; /* rounded-md */
                    placeholder-color: #64748b; /* slate-500 */
                    color: #0f172a; /* slate-900 */
                }
                .input-field:focus {
                    outline: none;
                    border-color: #475569; /* slate-600 */
                    z-index: 10;
                    box-shadow: 0 0 0 1px #475569;
                }
                .input-label { display: block; text-sm; font-medium; color: #475569; margin-bottom: 0.25rem; }
            `}</style>
        </div>
    );
};

export default SuggestionForm;