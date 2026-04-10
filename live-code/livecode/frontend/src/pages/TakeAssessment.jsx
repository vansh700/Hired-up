import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api, { mainApi } from '../api';

const TakeAssessment = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // { questionId, response, timeSpentSeconds }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [caId, setCaId] = useState(null);
    const [startTime, setStartTime] = useState(null);

    const [currentResponse, setCurrentResponse] = useState('');

    useEffect(() => {
        const startFlow = async () => {
            try {
                // 1. Start the assessment on backend to get candidateAssessmentId
                const startRes = await mainApi.post('/take/start', { assessmentId: id, jobId });
                setCaId(startRes.data.candidateAssessmentId);

                // 2. Fetch questions
                const fetchRes = await mainApi.get(`/take/assessment/${id}?jobId=${jobId}`);
                setAssessment(fetchRes.data.assessment);
                setQuestions(fetchRes.data.questions);
                setStartTime(Date.now());
            } catch (err) {
                console.error('Failed to start assessment', err);
                alert('Error starting assessment. Please try again.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        startFlow();
    }, [id, jobId, navigate]);

    const handleNext = () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        const newAnswer = {
            questionId: questions[currentIndex].id,
            response: currentResponse,
            timeSpentSeconds: timeSpent
        };

        setAnswers([...answers, newAnswer]);
        
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
            setCurrentResponse('');
            setStartTime(Date.now());
        } else {
            submitAssessment([...answers, newAnswer]);
        }
    };

    const submitAssessment = async (finalAnswers) => {
        setSubmitting(true);
        try {
            const res = await mainApi.post('/take/submit', {
                candidateAssessmentId: caId,
                answers: finalAnswers
            });
            console.log('Submission result:', res.data);
            if (res.data.applied) {
                navigate(`/jobs/${jobId}`); // Go back to job detail to see success state
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Submission failed', err);
            alert('Failed to submit results. Please contact support.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (submitting) return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-white rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold">Submitting your application...</h2>
            <p className="text-gray-400 mt-2">Finalizing scores and verifying requirements.</p>
        </div>
    );

    const question = questions[currentIndex];

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Progress Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">
                            {assessment?.name || 'Job Assessment'}
                        </h1>
                        <div className="text-xs text-gray-500 font-bold">
                            Step {currentIndex + 1} of {questions.length}
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold font-mono">
                        Time Lapsed: {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) % 60000) / 1000)}s
                    </div>
                </div>

                {/* Question Area */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 h-1.5 bg-indigo-600 transition-all duration-500" style={{ width: `${(currentIndex / questions.length) * 100}%` }}></div>
                    
                    <div className="mb-12">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase mb-4 inline-block">
                            {question.type === 'CODING' ? '💻 Coding Challenge' : '📝 Multiple Choice'}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold leading-snug">{question.content}</h2>
                    </div>

                    {question.type === 'CODING' ? (
                        <div className="space-y-4">
                            <textarea
                                value={currentResponse}
                                onChange={(e) => setCurrentResponse(e.target.value)}
                                placeholder="// Write your solution here..."
                                className="w-full h-80 bg-[#0d0d0f] border border-white/10 rounded-2xl p-6 font-mono text-indigo-300 focus:border-indigo-500 outline-none transition-all"
                            />
                            <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-gray-400">
                                💡 Tip: Ensure your code follows the expected signature. All test cases will be run upon submission.
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(question.options || []).map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setCurrentResponse(opt)}
                                    className={`w-full p-6 text-left rounded-2xl border transition-all flex items-center gap-4 group ${currentResponse === opt 
                                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${currentResponse === opt ? 'bg-white border-white text-indigo-600' : 'border-gray-600'}`}>
                                        {opt[0]}
                                    </div>
                                    <span className="font-medium text-lg">{opt}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-white/10 flex justify-end">
                        <button
                            disabled={!currentResponse}
                            onClick={handleNext}
                            className={`px-10 py-5 rounded-2xl font-black tracking-wider uppercase text-sm transition-all active:scale-95 ${!currentResponse 
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20'
                            }`}
                        >
                            {currentIndex + 1 === questions.length ? 'Finish & Apply' : 'Next Question'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeAssessment;
