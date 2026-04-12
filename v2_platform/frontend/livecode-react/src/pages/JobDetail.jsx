import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { mainApi } from '../api';

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myApplication, setMyApplication] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const [jobRes, appsRes] = await Promise.all([
                    mainApi.get(`/jobs/${id}`),
                    mainApi.get('/applications/my').catch(() => ({ data: [] }))
                ]);
                setJob(jobRes.data);
                
                const existing = appsRes.data.find(app => (app.job_id && app.job_id._id === id) || app.job_id === id);
                setMyApplication(existing);
            } catch (err) {
                console.error('Failed to fetch job details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = () => {
        if (!job.assessments || job.assessments.length === 0) {
            alert('No assessments found for this job. Contact the recruiter.');
            return;
        }
        // Save job context for the assessment
        localStorage.setItem('pendingJobId', id);
        localStorage.setItem('pendingAssessmentId', job.assessments[0].id);
        
        // Navigate to the assessment taking page
        navigate(`/take-assessment/${job.assessments[0].id}?jobId=${id}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-indigo-600 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Job not found</h1>
            <button onClick={() => navigate('/jobs')} className="px-6 py-2 bg-indigo-600 rounded-lg">Back to Jobs</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans">
            {/* Header / Hero */}
            <div className="relative h-64 bg-gradient-to-b from-indigo-900/20 to-transparent flex items-end">
                <div className="max-w-6xl mx-auto w-full px-6 pb-12 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 text-indigo-400 font-bold text-sm uppercase tracking-widest mb-4">
                            <span>💼 Job Posting</span>
                            <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                            <span>{job.location || 'Remote'}</span>
                        </div>
                        <h1 className="text-5xl font-black">{job.title}</h1>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/jobs')}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-sm">📝</span>
                            Job Description
                        </h3>
                        <div className="text-gray-400 leading-relaxed text-lg whitespace-pre-wrap">
                            {job.description || 'No description provided.'}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-sm">⚡</span>
                            Required Skills
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {(job.skillsRequired || job.skills_required || []).length > 0 ? (
                                (job.skillsRequired || job.skills_required).map(skill => (
                                    <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-indigo-300 font-semibold shadow-sm">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 italic">No specific skills listed.</span>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right: Sidebar / CTA */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-8">
                        {myApplication ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
                                <h3 className="text-2xl font-bold mb-2">Applied Successfully</h3>
                                <p className="text-gray-400 mb-6">Your application is being reviewed by the recruiter.</p>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                                    <div className="text-xs uppercase font-bold text-gray-500 mb-1">Current Status</div>
                                    <div className="text-indigo-400 font-bold">{myApplication.status}</div>
                                </div>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold mb-2">Ready to apply?</h3>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                    To maintain high quality, this position requires you to complete a skill assessment before applying.
                                </p>

                                {job.assessments && job.assessments.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-6">
                                            <h4 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                System Assessment Ready
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
                                                    <span>Multiple Choice</span>
                                                    <span className="font-bold text-gray-200">3 Questions</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-2">
                                                    <span>Coding Challenge</span>
                                                    <span className="font-bold text-yellow-400">1 Interactive Lab</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span>Expert Score Required</span>
                                                    <span className="font-bold text-gray-200">70%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coding Challenge Preview */}
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <div className="text-[10px] uppercase font-bold text-indigo-400 mb-2 tracking-widest">Target Coding Topic</div>
                                            <div className="text-sm text-gray-100 font-medium leading-relaxed italic">
                                                "{job.assessments[0]?.questions?.find(q => q.type === 'CODING')?.content?.substring(0, 80) || 'Complex Logic & Problem Solving'}..."
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleApply}
                                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 group"
                                        >
                                            Start Technical Assessment
                                            <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                                            <p className="text-orange-200 text-xs leading-relaxed">
                                                ⚠️ This job currently has no validated coding challenges. Would you like the AI to generate a technical test based on the job requirements?
                                            </p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                setLoading(true);
                                                try {
                                                    const res = await mainApi.post(`/assessments/generate/${id}`);
                                                    console.log('AI Generation success:', res.data);
                                                    window.location.reload();
                                                } catch (err) {
                                                    const errMsg = err.response?.data?.error || err.message || 'Unknown error';
                                                    console.error('AI Generation Critical Error:', err);
                                                    alert(`Critical Sync Failure: ${errMsg}\n\nCheck the backend logs for details.`);
                                                    setLoading(false);
                                                }
                                            }}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 animate-shimmer"
                                        >
                                            Generate AI Assessment ✨
                                        </button>
                                        <p className="text-[10px] text-center text-gray-500 uppercase font-bold tracking-widest">Recruiter Administrative Logic</p>
                                    </div>
                                )}
                                <p className="text-center text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest">
                                    Locked for direct submission
                                </p>
                            </>
                        )}
                    </div>

                    <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl border border-indigo-500/20">
                        <h4 className="font-bold mb-2">Tips for success</h4>
                        <ul className="text-xs text-gray-400 space-y-2 list-disc ml-4 leading-relaxed">
                            <li>Make sure you have a stable internet connection.</li>
                            <li>Review the required tech stack thoroughly.</li>
                            <li>The assessment will verify your actual hands-on skills.</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobDetail;
