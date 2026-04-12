import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { mainApi } from '../api';

const Jobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myApplications, setMyApplications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, appsRes] = await Promise.all([
                    mainApi.get('/jobs'),
                    mainApi.get('/applications/my').catch(() => ({ data: [] }))
                ]);
                setJobs(jobsRes.data);
                setMyApplications(appsRes.data);
            } catch (err) {
                console.error('Failed to fetch jobs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isApplied = (jobId) => {
        return myApplications.some(app => (app.job_id && app.job_id._id === jobId) || app.job_id === jobId);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-indigo-600 border-t-white rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Fetching opportunities...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 font-sans">
            <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Explore <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Jobs</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Find your next role and prove your skills.</p>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-all"
                >
                    ← Back to Dashboard
                </button>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.length > 0 ? jobs.map((job) => (
                        <div 
                            key={job.id}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                    <span className="text-2xl">💼</span>
                                </div>
                                {isApplied(job.id) ? (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/30">
                                        Applied
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-500/30">
                                        Active
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{job.title}</h2>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                                {job.description || "No description provided."}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {(job.techStack || []).slice(0, 3).map(tech => (
                                    <span key={tech} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-medium text-gray-300">
                                        {tech}
                                    </span>
                                ))}
                                {(job.techStack || []).length > 3 && (
                                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-medium text-gray-400">
                                        +{(job.techStack || []).length - 3}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                            >
                                {isApplied(job.id) ? 'View Status' : 'View & Apply'}
                                <span>→</span>
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <span className="text-5xl mb-4 block">🔎</span>
                            <h3 className="text-xl font-bold text-gray-300">No jobs listed yet</h3>
                            <p className="text-gray-500">Check back later for new opportunities!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Jobs;
