import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Mail, Lock, Github, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('candidate');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        companyName: '',
        designation: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const payload = isLogin 
            ? { email: formData.email, password: formData.password }
            : { ...formData, role: role.toUpperCase() };

        try {
            const response = await api.post(endpoint, payload);
            localStorage.setItem('hiredUpToken', response.data.accessToken);
            localStorage.setItem('hiredUpUser', JSON.stringify(response.data.user));
            
            if (response.data.user.role === 'RECRUITER') {
                navigate('/recruiter');
            } else {
                navigate('/profile');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
                <div className="text-center mb-8">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-sm">{isLogin ? 'Enter your credentials to access the platform.' : 'Join the future of skill-based hiring.'}</p>
                </div>

                <div className="flex bg-glass p-2 rounded-lg mb-8 border border-subtle">
                    <div className={`flex-1 text-center p-2 rounded-md cursor-pointer transition-all ${isLogin ? 'bg-card border border-subtle text-main' : 'text-muted'}`} onClick={() => setIsLogin(true)}>Log In</div>
                    <div className={`flex-1 text-center p-2 rounded-md cursor-pointer transition-all ${!isLogin ? 'bg-card border border-subtle text-main' : 'text-muted'}`} onClick={() => setIsLogin(false)}>Sign Up</div>
                </div>

                {!isLogin && (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className={`p-4 border rounded-xl cursor-pointer text-center transition-all ${role === 'candidate' ? 'border-accent bg-accent-glow' : 'border-subtle'}`} onClick={() => setRole('candidate')}>
                            <User className="mx-auto mb-2" size={20} />
                            <span className="text-xs font-bold">Candidate</span>
                        </div>
                        <div className={`p-4 border rounded-xl cursor-pointer text-center transition-all ${role === 'recruiter' ? 'border-accent bg-accent-glow' : 'border-subtle'}`} onClick={() => setRole('recruiter')}>
                            <Briefcase className="mx-auto mb-2" size={20} />
                            <span className="text-xs font-bold">Recruiter</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleAuth}>
                    <div className="input-group mb-4">
                        <input type="email" id="email" className="input-field" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="input-group mb-4">
                        <input type="password" id="password" className="input-field" placeholder="Password" required value={formData.password} onChange={handleChange} />
                    </div>

                    {!isLogin && (
                        <div className="animate-fade-in">
                            <div className="input-group mb-4">
                                <input type="text" id="fullName" className="input-field" placeholder="Full Name" required value={formData.fullName} onChange={handleChange} />
                            </div>
                            {role === 'recruiter' && (
                                <>
                                    <div className="input-group mb-4">
                                        <input type="text" id="companyName" className="input-field" placeholder="Company Name" required value={formData.companyName} onChange={handleChange} />
                                    </div>
                                    <div className="input-group mb-4">
                                        <input type="text" id="designation" className="input-field" placeholder="Designation" required value={formData.designation} onChange={handleChange} />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {error && <p className="text-danger text-sm mb-4">{error}</p>}

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ margin: '2rem 0', textAlign: 'center', opacity: 0.5, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px' }}>OR CONTINUE WITH</div>
                
                <div className="grid grid-cols-2 gap-4">
                    <button className="btn btn-outline flex gap-2 items-center"><Github size={18} /> Github</button>
                    <button className="btn btn-outline flex gap-2 items-center">Google</button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
