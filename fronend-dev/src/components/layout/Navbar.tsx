import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeams, useUpcomingFixtures } from '../../api/queries';
import { getTeamLogoUrl } from '../../utils/teamLogos';
import { MatchListModal } from '../common/MatchListModal';
import { AboutModal } from '../common/AboutModal';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { data: teams } = useTeams();
    const [isTeamsOpen, setIsTeamsOpen] = useState(false);
    const [isFixturesOpen, setIsFixturesOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    // Mobile States
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileTeamsOpen, setIsMobileTeamsOpen] = useState(false);

    const { data: upcomingFixtures } = useUpcomingFixtures();

    const navItems = ['Overview', 'Players', 'Teams', 'Fixtures', 'Fantasy'];

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50">
                <div className="glass-panel rounded-full px-6 md:px-8 h-16 flex items-center justify-between shadow-xl shadow-purple-900/5 bg-white/80 backdrop-blur-xl border border-white/40 relative">
                    <div className="flex items-center space-x-8">
                        {/* Logo Section */}
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 relative flex items-center justify-center">
                                <img src="/logo.png" alt="Premier League Dashboard" className="w-full h-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-slate-900 hidden md:block">
                                Premier League<span className="text-pl-purple"> Dashboard</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex space-x-1">
                            {navItems.map((item) => {
                                if (item === 'Teams') {
                                    return (
                                        <div
                                            key={item}
                                            className="relative group"
                                            onMouseEnter={() => setIsTeamsOpen(true)}
                                            onMouseLeave={() => setIsTeamsOpen(false)}
                                        >
                                            <button
                                                className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-pl-purple hover:bg-pl-purple/5 transition-all duration-300 flex items-center"
                                            >
                                                {item}
                                                <ChevronDown size={14} className="ml-1 opacity-50" />
                                            </button>

                                            <AnimatePresence>
                                                {isTeamsOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 grid grid-cols-2 gap-2 z-50 overflow-hidden"
                                                    >
                                                        {teams?.map(team => (
                                                            <button
                                                                key={team.id}
                                                                onClick={() => {
                                                                    navigate(`/team/${team.id}`);
                                                                    setIsTeamsOpen(false);
                                                                }}
                                                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                                                            >
                                                                <img src={getTeamLogoUrl(team.name)} alt={team.abbr} className="w-6 h-6 object-contain" />
                                                                <span className="text-sm font-bold text-slate-700 truncate">{team.name}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            if (item === 'Overview') navigate('/');
                                            else if (item === 'Players') navigate('/players');
                                            else if (item === 'Fixtures') setIsFixturesOpen(true);
                                            else if (item === 'Fantasy') navigate('/fantasy');
                                        }}
                                        className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-pl-purple hover:bg-pl-purple/5 transition-all duration-300"
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAboutOpen(true)}
                            className="bg-gradient-to-r from-pl-purple to-pl-neon-pink text-white rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow hidden md:block"
                        >
                            About Project
                        </motion.button>

                        {/* Mobile Hamburger */}
                        <button
                            className="md:hidden p-2 text-slate-900"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 relative flex items-center justify-center">
                                    <img src="/logo.png" alt="Premier League Dashboard" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-lg font-black tracking-tighter text-slate-900">
                                    PL<span className="text-pl-purple">Dash</span>
                                </span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-full bg-gray-100 text-slate-900 hover:bg-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {navItems.map((item) => {
                                if (item === 'Teams') {
                                    return (
                                        <div key={item} className="space-y-4">
                                            <button
                                                onClick={() => setIsMobileTeamsOpen(!isMobileTeamsOpen)}
                                                className="w-full flex items-center justify-between text-2xl font-black text-slate-900"
                                            >
                                                <span>Teams</span>
                                                <ChevronDown
                                                    size={24}
                                                    className={`transition-transform duration-300 ${isMobileTeamsOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            <AnimatePresence>
                                                {isMobileTeamsOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="grid grid-cols-2 gap-3 pl-4 overflow-hidden"
                                                    >
                                                        {teams?.map(team => (
                                                            <button
                                                                key={team.id}
                                                                onClick={() => handleNavigate(`/team/${team.id}`)}
                                                                className="flex items-center space-x-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                                            >
                                                                <img src={getTeamLogoUrl(team.name)} alt={team.abbr} className="w-6 h-6 object-contain" />
                                                                <span className="text-xs font-bold text-slate-700 truncate">{team.name}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            if (item === 'Overview') handleNavigate('/');
                                            else if (item === 'Players') handleNavigate('/players');
                                            else if (item === 'Fixtures') {
                                                setIsFixturesOpen(true);
                                                setIsMobileMenuOpen(false);
                                            }
                                            else if (item === 'Fantasy') handleNavigate('/fantasy');
                                        }}
                                        className="block text-2xl font-black text-slate-900 text-left hover:text-pl-purple transition-colors"
                                    >
                                        {item}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => {
                                    setIsAboutOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full bg-gradient-to-r from-pl-purple to-pl-neon-pink text-white rounded-2xl px-6 py-4 text-center font-bold uppercase tracking-widest shadow-lg shadow-purple-500/30"
                            >
                                About Project
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <MatchListModal
                isOpen={isFixturesOpen}
                onClose={() => setIsFixturesOpen(false)}
                title="All Upcoming Fixtures"
                matches={upcomingFixtures || []}
                variant="upcoming"
            />

            <AboutModal
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
            />
        </>
    );
};
