'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

    return (
        <Button
            onClick={toggleTheme}
            variant={isDark ? 'default' : 'outline'}
            className="w-full justify-center gap-2"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {isDark ? (
                <>
                    <Sun className="h-5 w-5" aria-hidden="true" />
                    <span>Light</span>
                </>
            ) : (
                <>
                    <Moon className="h-5 w-5" aria-hidden="true" />
                    <span>Dark</span>
                </>
            )}
        </Button>
    );
}
