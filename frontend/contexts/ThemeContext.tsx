import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    isAccessibilityMode: boolean;
    toggleAccessibility: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
    children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const toggleAccessibility = () => {
        setIsAccessibilityMode(prev => !prev);
        if (isDarkMode) toggleDarkMode();
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, isAccessibilityMode, toggleAccessibility }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const UseTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}


