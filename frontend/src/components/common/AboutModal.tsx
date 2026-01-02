import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Github, Linkedin, Globe, Server, Terminal, Cloud, Database, Activity, Zap } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    const [isZoomed, setIsZoomed] = useState(false);

    // Handle browser back button
    useEffect(() => {
        if (isOpen) {
            // Push a new state when modal opens
            window.history.pushState({ modal: 'about' }, '', window.location.pathname);

            const handlePopState = () => {
                onClose();
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isOpen, onClose]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isZoomed) setIsZoomed(false);
                else onClose();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, isZoomed]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[4px]"
                    />

                    {/* Modal Content - Widened to max-w-7xl to prevent scrolling */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-slate-800">Contact & Infrastructure</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body - 2 Column Grid */}
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

                                {/* Left Column: Bio & Contact */}
                                <div className="space-y-6">
                                    {/* Bio Section */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-full shadow-sm text-pl-purple mt-1 shrink-0">
                                                <Server size={20} />
                                            </div>
                                            <div className="space-y-3">
                                                <p className="font-bold text-slate-900 text-lg">Hi, I’m Tamhid Chowdhury, Cloud DevOps Engineer.</p>
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    This football data analytics application is a personal project I built to showcase my skills in data engineering, cloud, and DevOps. It combines real match data with custom-built APIs, visualizations, and interactive dashboards to explore insights into the game. Everything is fully self-hosted, giving me the opportunity to design, deploy, and manage the entire stack—from database to front-end—just as I would in a production environment.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Links */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Get in Touch</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <a href="mailto:tamhidchowdhury@gmail.com" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-red-100 hover:bg-red-50/50 transition-colors text-slate-700 group">
                                                <Mail size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium truncate">Email Me</span>
                                            </a>
                                            <a href="https://github.com/tamhid92" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors text-slate-700 group">
                                                <Github size={18} className="text-slate-900 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium truncate">GitHub</span>
                                            </a>
                                            <a href="https://www.linkedin.com/in/tamhidchowdhury" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors text-slate-700 group">
                                                <Linkedin size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium truncate">LinkedIn</span>
                                            </a>
                                            <a href="https://www.tchowdhury.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors text-slate-700 group">
                                                <Globe size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium truncate">Portfolio</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Infrastructure */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <Cloud size={20} className="text-slate-800" />
                                        <h3 className="font-bold text-slate-900 text-base">Infrastructure & Deployment</h3>
                                    </div>

                                    <div
                                        className="relative group cursor-zoom-in rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all h-40 lg:h-56"
                                        onClick={() => setIsZoomed(true)}
                                    >
                                        <img
                                            src="/infra.png"
                                            alt="Infrastructure Diagram"
                                            className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                                            <div className="bg-black/75 text-white px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <span>Click to enlarge diagram</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 text-xs">
                                        {/* CI/CD */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                            <div className="mt-0.5 text-slate-900 shrink-0">
                                                <Github size={16} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-bold text-slate-900">Push to GitHub</h4>
                                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                                    Triggers GitHub Actions. The workflow runs tests, builds Docker images for the frontend, API, and data jobs, and pushes them to ghcr.io.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Kubernetes */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                            <div className="mt-0.5 text-blue-600 shrink-0">
                                                <Terminal size={16} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-bold text-slate-900">Kubernetes Deployment</h4>
                                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                                    A self-hosted runner / Jenkins job with RBAC deploys to Kubernetes via <code className="bg-white border border-gray-200 px-1 py-0.5 rounded text-gray-800 font-mono">kubectl rollout</code> against the cluster API.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Network & Storage */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                            <div className="mt-0.5 text-emerald-500 shrink-0">
                                                <Database size={16} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-bold text-slate-900">Network & Storage</h4>
                                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                                    Exposed through Cloudflare Tunnel & DNS. Traffic hits NGINX Ingress → Services (frontend/api). Stateful data lives in a Postgres StatefulSet with PVC.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Monitoring */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                            <div className="mt-0.5 text-orange-500 shrink-0">
                                                <Activity size={16} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-bold text-slate-900">Monitoring Stack</h4>
                                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                                    Prometheus scrapes metrics; Grafana dashboards visualize them; Promtail ships logs to Loki for querying.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick Flow */}
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm">
                                            <div className="mt-0.5 text-yellow-400 shrink-0">
                                                <Zap size={16} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="font-bold text-white">Quick Flow</h4>
                                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                                    Push → Actions Build → GHCR → Kubelet Pull → Rollout Update. Cloudflare Tunnel handles public access.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    onClick={() => setIsZoomed(false)}
                >
                    <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        src="/infra.png"
                        alt="Infrastructure Diagram Full View"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-zoom-out"
                    />
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={() => setIsZoomed(false)}
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
