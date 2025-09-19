
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useExam } from '../App.tsx';
import { ClockIcon, PowerIcon, BookOpenIcon } from './icons.tsx';

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { settings } = useExam();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState('');
    const [isExamActive, setIsExamActive] = useState(false);

    useEffect(() => {
        if (!settings) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const startTime = new Date(settings.startTime).getTime();
            const endTime = new Date(settings.endTime).getTime();

            if (now >= startTime && now < endTime) {
                setIsExamActive(true);
                const distance = endTime - now;
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
            } else {
                setIsExamActive(false);
                setTimeLeft('');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [settings]);
    
    const formattedEndTime = settings ? new Date(settings.endTime).toLocaleString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dasbor Siswa</h1>
                        <p className="text-gray-500">Selamat datang, {user?.username}!</p>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                        <PowerIcon className="w-5 h-5"/>
                        Keluar
                    </button>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 text-center">
                    {isExamActive && settings ? (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-indigo-700">Ujian Telah Dimulai!</h2>
                            <p className="text-lg text-gray-600">Anda memiliki ujian yang sedang berlangsung.</p>
                            
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-800 p-6 rounded-lg text-left space-y-4">
                                <div className="flex items-center">
                                    <BookOpenIcon className="w-6 h-6 mr-3 text-indigo-500"/>
                                    <div>
                                        <p className="font-semibold">Mata Pelajaran</p>
                                        <p className="text-lg">{settings.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ClockIcon className="w-6 h-6 mr-3 text-indigo-500"/>
                                    <div>
                                        <p className="font-semibold">Sisa Waktu</p>
                                        <p className="text-lg font-mono tracking-wider">{timeLeft}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <ClockIcon className="w-6 h-6 mr-3 text-red-500"/>
                                    <div>
                                        <p className="font-semibold">Ujian Berakhir Pada</p>
                                        <p className="text-lg">{formattedEndTime}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/exam')}
                                className="w-full py-4 px-6 bg-green-600 text-white font-bold text-xl rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
                            >
                                Mulai Kerjakan
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800">Tidak Ada Ujian Aktif</h2>
                            <p className="text-lg text-gray-500">Saat ini tidak ada jadwal ujian yang sedang berlangsung. Silakan periksa kembali nanti.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;