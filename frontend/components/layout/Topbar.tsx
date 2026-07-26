'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, LogOut, Building, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Topbar() {
  const [profile, setProfile] = useState({
    displayName: 'Enterprise Admin',
    email: 'admin@docintel.com',
    tenantName: 'Default Workspace',
    tenantId: 'tenant-demo-456',
    role: 'Admin',
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load from localStorage on mount
    const storedName = localStorage.getItem('display_name');
    const storedEmail = localStorage.getItem('email');
    const storedTenantName = localStorage.getItem('tenant_name');
    const storedTenantId = localStorage.getItem('tenant_id');
    const storedRole = localStorage.getItem('role');

    setProfile({
      displayName: (storedName || storedTenantName || 'Enterprise Admin').toUpperCase(),
      email: storedEmail || 'admin@docintel.com',
      tenantName: (storedTenantName || 'Default Workspace').toUpperCase(),
      tenantId: storedTenantId || 'tenant-demo-456',
      role: (storedRole || 'Admin').toUpperCase(),
    });

    // Also fetch fresh details from backend API /me if token exists
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const nameToUse = data.display_name || data.tenant_name || storedName || storedTenantName || data.email.split('@')[0];
            const tenantToUse = data.tenant_name || storedTenantName || 'Workspace';
            const updatedProfile = {
              displayName: nameToUse.toUpperCase(),
              email: data.email,
              tenantName: tenantToUse.toUpperCase(),
              tenantId: data.tenant_id,
              role: (data.role || 'Admin').toUpperCase(),
            };
            setProfile(updatedProfile);
            localStorage.setItem('display_name', updatedProfile.displayName);
            localStorage.setItem('email', updatedProfile.email);
            localStorage.setItem('tenant_name', updatedProfile.tenantName);
            localStorage.setItem('role', updatedProfile.role);
          }
        })
        .catch(() => {});
    }

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');
    localStorage.removeItem('display_name');
    localStorage.removeItem('tenant_name');
    localStorage.removeItem('role');
    router.push('/');
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'EA';
  };

  return (
    <header className="h-20 dark:border-slate-800/80 border-slate-200/90 border-b dark:bg-[#091827]/80 bg-white/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
      {/* Search / Command Bar Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-3 px-4 py-2 rounded-xl dark:bg-slate-800/50 bg-slate-100 dark:border-slate-700/60 border-slate-300/80 text-slate-500 dark:text-slate-400 text-xs hover:border-blue-500/60 transition-colors w-72 backdrop-blur-md group"
        >
          <Search className="w-4 h-4 text-blue-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="flex-1 text-left">Search documents or query...</span>
          <kbd className="px-2 py-0.5 rounded dark:bg-slate-900 bg-white text-[10px] text-blue-600 dark:text-cyan-400 dark:border-slate-700 border-slate-300 border font-mono flex items-center gap-1">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="h-5 w-px dark:bg-slate-800 bg-slate-200 mx-1"></div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative pl-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 text-xs font-bold font-mono shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              {getInitials(profile.displayName)}
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold dark:text-white text-slate-900 block leading-tight truncate max-w-[140px] uppercase tracking-wider font-mono">
                  {profile.displayName.toUpperCase()}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block leading-tight truncate max-w-[140px] uppercase tracking-wide">
                {profile.tenantName.toUpperCase()}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 dark:bg-[#091827]/95 bg-white/95 backdrop-blur-xl rounded-2xl border dark:border-slate-800 border-slate-200/90 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header Info */}
              <div className="pb-3 border-b dark:border-slate-800 border-slate-200/80 mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold font-mono shadow-md shrink-0">
                    {getInitials(profile.displayName)}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold dark:text-white text-slate-900 truncate uppercase tracking-wider font-mono">{profile.displayName.toUpperCase()}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t dark:border-slate-800/60 border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-medium">Role:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/30 font-semibold uppercase font-mono">
                    {profile.role}
                  </span>
                </div>
              </div>

              {/* Workspace Details */}
              <div className="pb-3 border-b dark:border-slate-800 border-slate-200/80 mb-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                  <Building className="w-4 h-4 text-blue-500 dark:text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-mono">Organization / Workspace</span>
                    <span className="font-bold truncate block uppercase tracking-wide font-mono">{profile.tenantName.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white border border-rose-500/20 hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-rose-500/25 group/logout"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 group-hover/logout:-translate-x-0.5 transition-transform" />
                  <span>Log Out of Workspace</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
