
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useExam } from '../App.tsx';
import type { StudentAnswer } from '../types.ts';
import { gradeAnswer } from '../services/geminiService.ts';
import { ClockIcon } from './icons.tsx';

// Define the component outside of ExamPage to prevent re-creation on re-renders
const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="text-lg text-gray-600 font-semibold">Sedang menilai jawaban Anda...</p>
        <p className="text-sm text-gray-500">Proses ini mungkin memakan waktu beberapa saat. Mohon jangan menutup halaman ini.</p>
    </div>
);

const ExamPage: React.FC = () => {
    const { user } = useAuth();
    const { questions, settings, addResult } = useExam();
    const navigate = useNavigate();

    const shuffledQuestions = useMemo(() => [...questions].sort(() => Math.random() - 0.5), [questions]);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>(() => Array(shuffledQuestions.length).fill(''));
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionComplete, setSubmissionComplete] = useState(false);
    const [finalScore, setFinalScore] = useState(0);


    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        const studentAnswers: StudentAnswer[] = shuffledQuestions.map((q, i) => ({
            question: q,
            answer: answers[i] || 'Tidak dijawab'
        }));

        let totalScore = 0;
        const gradingPromises = studentAnswers.map(sa => gradeAnswer(sa.question, sa.answer));
        
        try {
            const scores = await Promise.all(gradingPromises);
            totalScore = scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length;
        } catch (error) {
            console.error("Error during grading:", error);
            // Handle grading failure if necessary
        }

        if (user && user.nisn) {
            addResult({
                studentName: user.username,
                studentNisn: user.nisn,
                score: totalScore,
                submissionTime: new Date().toLocaleString('id-ID'),
                answers: studentAnswers,
            });
        }
        
        setFinalScore(totalScore);
        setSubmissionComplete(true);
        setIsSubmitting(false);

    }, [shuffledQuestions, answers, user, addResult]);

    useEffect(() => {
        if (!settings) {
            navigate('/student');
            return;
        }
        const endTime = new Date(settings.endTime).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = endTime - now;
            setTimeLeft(Math.max(0, distance));

            if (distance < 0) {
                clearInterval(interval);
                if (!isSubmitting && !submissionComplete) {
                   handleSubmit();
                }
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call
        
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings, navigate, handleSubmit, isSubmitting, submissionComplete]);


    if (!settings) return null;
    if (submissionComplete) {
        return (
             <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
                    <h2 className="text-3xl font-bold text-green-600">Ujian Selesai!</h2>
                    <p className="text-lg text-gray-700">Jawaban Anda telah berhasil dikirim dan dinilai.</p>
                    <div>
                        <p className="text-gray-500 text-sm">NILAI AKHIR ANDA</p>
                        <p className="text-6xl font-bold text-indigo-700">{finalScore.toFixed(2)}</p>
                    </div>
                     <button
                        onClick={() => navigate('/student')}
                        className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                    >
                        Kembali ke Dasbor
                    </button>
                </div>
            </div>
        );
    }
    
    if (isSubmitting) {
        return (
             <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
                   <LoadingSpinner />
                </div>
            </div>
        );
    }

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-4 md:p-8">
            <header className="w-full max-w-5xl mx-auto bg-white rounded-t-lg shadow p-4 flex justify-between items-center sticky top-4 z-10">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">{settings.subject}</h1>
                    <p className="text-sm text-gray-500">Soal {currentQuestionIndex + 1} dari {shuffledQuestions.length}</p>
                </div>
                <div className={`flex items-center gap-2 font-mono text-xl md:text-2xl font-bold p-2 rounded-lg ${timeLeft < 300000 ? 'text-red-600 bg-red-100' : 'text-indigo-600 bg-indigo-100'}`}>
                    <ClockIcon className="w-6 h-6"/>
                    <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
            </header>

            <main className="w-full max-w-5xl mx-auto bg-white shadow-lg flex-grow p-6 md:p-8">
                <div className="prose max-w-none">
                    <p className="text-lg text-gray-800">{currentQuestion.soal}</p>
                </div>
                <textarea
                    value={answers[currentQuestionIndex]}
                    onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[currentQuestionIndex] = e.target.value;
                        setAnswers(newAnswers);
                    }}
                    placeholder="Ketik jawaban Anda di sini..."
                    className="mt-6 w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                />
            </main>
            
            <footer className="w-full max-w-5xl mx-auto bg-gray-50 rounded-b-lg shadow p-4 sticky bottom-4 z-10">
                <div className="flex items-center justify-between">
                     <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sebelumnya
                    </button>
                    
                    <div className="flex-grow flex items-center justify-center gap-1 md:gap-2 px-2 overflow-x-auto">
                        {shuffledQuestions.map((_, index) => (
                             <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-8 h-8 md:w-9 md:h-9 flex-shrink-0 rounded-full text-xs font-bold transition ${
                                    currentQuestionIndex === index ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-500' 
                                    : answers[index] ? 'bg-green-500 text-white' : 'bg-white border border-gray-300'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {currentQuestionIndex === shuffledQuestions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700"
                        >
                            Kirim Jawaban
                        </button>
                    ) : (
                         <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(shuffledQuestions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === shuffledQuestions.length - 1}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Selanjutnya
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default ExamPage;