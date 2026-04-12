import React from 'react';
import { Rocket, ShieldCheck, Zap, Code, BarChart, UserCheck } from 'lucide-react';

const Home = () => {
    return (
        <div className="home-page">
            <header style={{ paddingTop: '160px', paddingBottom: '100px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: -1 }}></div>

                <div className="container flex flex-col items-center text-center">
                    <div className="animate-fade-in">
                        <span className="badge-v1">🚀 AI-Powered Recruitment — Now with Skill Gap + Interview AI</span>
                        <h1 className="hero-title">
                            Hire Beyond the Resume.<br />
                            <span className="text-gradient">Validate True Potential.</span>
                        </h1>
                        <p className="hero-subtitle">
                            The first recruitment platform that focuses on skills, not keywords.
                            AI evaluates coding, aptitude, skill gaps, and behavioral fit in real-time.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button className="btn btn-primary btn-glow">Get Started Free</button>
                            <button className="btn btn-outline">Try Skill Gap →</button>
                        </div>
                    </div>

                    <div className="glass-card animate-fade-in" style={{ marginTop: '4rem', width: '100%', height: '400px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', textAlign: 'left' }}>
                            <div style={{ color: '#c084fc', fontFamily: 'monospace' }}>
                                <span>function</span> <span style={{ color: '#67e8f9' }}>evaluateCandidate</span>(skills) {'{'} <br />
                                &nbsp;&nbsp;<span>return</span> skills.score &gt; 90 ? <span style={{ color: '#86efac' }}>'HIRE'</span> : <span style={{ color: '#fca5a5' }}>'REVIEW'</span>; <br />
                                {'}'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section id="features" style={{ padding: '100px 0' }}>
                <div className="container">
                    <h2 className="text-center mb-10">Engineered for <span className="text-gradient">Precision</span></h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <FeatureCard 
                            icon={<ShieldCheck size={24} />} 
                            title="Bias-Free Scoring" 
                            desc="Objective evaluation based on code quality, efficiency, and problem solving." 
                        />
                        <FeatureCard 
                            icon={<Code size={24} />} 
                            title="Real-World Code" 
                            desc="Candidates solve actual problems in a browser-based IDE." 
                        />
                        <FeatureCard 
                            icon={<Zap size={24} />} 
                            title="Instant Feedback" 
                            desc="Get real-time analysis on candidate performance and skill gaps." 
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card">
        <div style={{ width: '48px', height: '48px', background: 'rgba(124, 58, 237, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#6366F1' }}>
            {icon}
        </div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </div>
);

export default Home;
