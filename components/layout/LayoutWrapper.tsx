'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

const pagesWithSidebar = ['/dashboard', '/documents', '/upload', '/profile'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showSidebar = pagesWithSidebar.some(path => pathname?.startsWith(path));

    if (showSidebar) {
        return (
            <div className="flex min-h-screen bg-slate-950 w-full">
                <Sidebar />
                <main className="flex-1 min-w-0 w-full overflow-auto lg:pl-72">
                    {children}
                </main>
            </div>
        );
    }

    return <>{children}</>;
}
