
import React, { useState } from 'react';
import { useAuth } from '../App.tsx';
import type { UserRole } from '../types.ts';

const Login: React.FC = () => {
    const [role, setRole] = useState<UserRole>('Siswa');
    const [username, setUsername] = useState('');
    const [nisnOrPass, setNisnOrPass] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!username || !nisnOrPass) {
            setError('Semua kolom harus diisi.');
            return;
        }
        const success = login(username, nisnOrPass);
        if (!success) {
            setError('Username atau password/NISN salah.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Selamat Datang</h1>
                    <p className="text-gray-500 mt-2">Masuk ke sistem ujian esai AI</p>
                </div>

                <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                        onClick={() => setRole('Siswa')}
                        className={`w-full py-2.5 text-sm font-medium leading-5 rounded-full transition-all duration-300 ${
                            role === 'Siswa' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-white/50'
                        }`}
                    >
                        Siswa
                    </button>
                    <button
                        onClick={() => setRole('Admin')}
                        className={`w-full py-2.5 text-sm font-medium leading-5 rounded-full transition-all duration-300 ${
                            role === 'Admin' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-white/50'
                        }`}
                    >
                        Admin (Guru)
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-gray-700">{role === 'Siswa' ? 'Nama Lengkap' : 'Username'}</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={role === 'Siswa' ? 'Contoh: Budi Santoso' : 'admin'}
                        />
                    </div>
                    <div>
                        <label htmlFor="nisnOrPass" className="text-sm font-medium text-gray-700">{role === 'Siswa' ? 'NISN' : 'Password'}</label>
                        <input
                            id="nisnOrPass"
                            type={role === 'Admin' ? 'password' : 'text'}
                            value={nisnOrPass}
                            onChange={(e) => setNisnOrPass(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={role === 'Siswa' ? 'Masukkan NISN Anda' : '········'}
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                        >
                            Masuk
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;