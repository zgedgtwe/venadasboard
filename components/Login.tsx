import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
    onLoginSuccess: () => void;
    switchToSignup: () => void;
    switchToSuggestion: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, switchToSignup, switchToSuggestion }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [message, setMessage] = useState('');
    
    const { signIn, resetPassword, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const { data, error } = await signIn(email, password);
        
        if (error) {
            setMessage(error);
        } else if (data?.user) {
            onLoginSuccess();
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const { error } = await resetPassword(forgotPasswordEmail);
        
        if (error) {
            setMessage(error);
        } else {
            setMessage('Link reset password telah dikirim ke email Anda.');
            setShowForgotPassword(false);
        }
    };

    if (showForgotPassword) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
                        <p className="mt-2 text-sm text-slate-500">Masukkan email Anda untuk reset password.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                        {message && (
                            <div className={`p-3 border rounded-lg text-sm ${
                                message.includes('dikirim') 
                                    ? 'bg-green-100 border-green-200 text-green-700'
                                    : 'bg-red-100 border-red-200 text-red-700'
                            }`}>
                                {message}
                            </div>
                        )}
                        
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                                placeholder="Email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(false)}
                                className="flex-1 py-2 px-4 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400"
                            >
                                {loading ? 'Mengirim...' : 'Kirim'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Vena Pictures</h1>
                    <p className="mt-2 text-sm text-slate-500">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {(error || message) && (
                        <div className={`p-3 border rounded-lg text-sm ${
                            message.includes('dikirim') 
                                ? 'bg-green-100 border-green-200 text-green-700'
                                : 'bg-red-100 border-red-200 text-red-700'
                        }`}>
                            {error || message}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-for-login" className="sr-only">Kata Sandi</label>
                            <input
                                id="password-for-login"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 focus:z-10 sm:text-sm"
                                placeholder="Kata Sandi"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="font-medium text-slate-600 hover:text-slate-500"
                            >
                                Lupa kata sandi?
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400"
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </div>
                     <p className="text-center text-sm text-slate-500">
                        Belum punya akun?{' '}
                        <button type="button" onClick={switchToSignup} className="font-medium text-slate-600 hover:text-slate-500 underline">
                            Daftar di sini
                        </button>
                    </p>
                </form>
                <div className="border-t pt-6">
                     <p className="text-center text-sm text-slate-500">
                        Punya saran untuk kami?{' '}
                        <button type="button" onClick={switchToSuggestion} className="font-medium text-slate-600 hover:text-slate-500 underline">
                            Bagikan di sini
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;