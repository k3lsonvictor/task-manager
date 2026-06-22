'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';

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
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 00-1.414 0l-2.12 2.12a1 1 0 001.414 1.414L9 11.414l1.464 1.465a1 1 0 001.414-1.414zM15 11a1 1 0 100-2h-1a1 1 0 100 2h1zm2.657-5.657a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 001.414 1.414l1.414-1.414zm2.121 2.121a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM4 11a1 1 0 100-2H3a1 1 0 100 2h1zm-.464-7.464a1 1 0 00-1.414 1.414l.707.707A1 1 0 003.121 3.05l-.707-.707z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>Light</span>
                </>
            ) : (
                <>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    <span>Dark</span>
                </>
            )}
        </Button>
    );
}
