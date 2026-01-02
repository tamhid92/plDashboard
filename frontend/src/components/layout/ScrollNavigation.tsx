import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Trophy, Calendar, Activity, BarChart2 } from 'lucide-react';

const sections = [
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'standings', label: 'Table', icon: Trophy },
    { id: 'progression', label: 'Progression', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

export const ScrollNavigation: React.FC = () => {
    const [activeSection, setActiveSection] = useState('fixtures');

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map(s => document.getElementById(s.id));
            const scrollPosition = window.scrollY + 200; // Offset

            let current = sections[0].id;
            sectionElements.forEach(el => {
                if (el && el.offsetTop <= scrollPosition) {
                    current = el.id;
                }
            });
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-6">
            {sections.map((section) => {
                const isActive = activeSection === section.id;
                const Icon = section.icon;

                return (
                    <button
                        key={section.id}
                        onClick={() => scrollTo(section.id)}
                        className="group flex items-center space-x-3 transition-all duration-300 relative"
                    >
                        {/* Dot / Icon container */}
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm border",
                            isActive
                                ? "bg-pl-purple text-white border-pl-purple scale-110 shadow-pl-purple/20"
                                : "bg-white text-gray-400 border-gray-200 group-hover:border-pl-purple group-hover:text-pl-purple"
                        )}>
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>

                        {/* Label Tooltip */}
                        <span className={clsx(
                            "absolute left-14 bg-white px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 text-xs font-bold uppercase tracking-wider text-slate-900 transition-all duration-300 pointer-events-none whitespace-nowrap",
                            isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        )}>
                            {section.label}
                        </span>

                        {/* Connecting Line (Visual only, incomplete for now as it needs absolute positioning relative to parent which is flex col) */}
                    </button>
                );
            })}
        </div>
    );
};
