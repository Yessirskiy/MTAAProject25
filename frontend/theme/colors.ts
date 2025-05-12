type ColorPalette = {
    background: string;      // Main app background
    surface: string;         // Elevated surfaces, cards
    card: string;            // Subtle containers or cards
    textGrey: string;
    textPrimary: string;     // Primary text
    textSecondary: string;   // Muted/secondary text
    textInverse: string;     // Text on dark background (used in dark mode)
    border: string;          // Borders, dividers
    icon: string;            // Icon color
    disabled: string;        // Disabled text/input
    buttonBackground: string;// Generic button background
    accentRed: string;       // Red - alerts or remove buttons
    accentRedLight: string;  // Lighter red - highlights or warnings
    accentBlue: string;      // Blue - links, buttons
    accentBlueAlt: string;   // Alternate blue - highlights
    darkGrey: string;
    lightGrey: string;
    bar: string;
}

export const getColors = (isDarkMode: boolean): ColorPalette => {
  return isDarkMode
    ? {
        background: '#121212',        // Deep black background
        surface: '#1a1a1a',           // Elevated surface (e.g., modals)
        card: '#1e1e1e',              // Card/container backgrounds
        textGrey: '#ccc',
        textPrimary: '#fff',          // Main readable text
        textSecondary: '#ccc',        // Muted text
        textInverse: '#000',          // Only if text appears on light bg in dark mode
        border: '#444',               // Subtle divider lines
        icon: '#bbb',                 // Icon color
        disabled: '#888',             // Disabled text or inputs
        buttonBackground: '#2a2a2a',  // Dark button bg
        accentRed: '#D63E3E',
        accentRedLight: '#FF6C6C',
        accentBlue: '#007AFF',
        accentBlueAlt: '#2e86de',
        darkGrey: '#ddd',
        lightGrey: '#1c1c1c',
        bar: '#1F1F1F',
      }
    : {
        background: '#fff',           // Light background
        surface: '#f2f2f2',           // Elevated areas
        card: '#eee',                 // Light card background
        textGrey: '#999',
        textPrimary: '#000',          // Main readable text
        textSecondary: '#666',        // Muted gray
        textInverse: '#fff',          // Text on dark elements
        border: '#ccc',               // Light divider
        icon: '#888',                 // Icon gray
        disabled: '#aaa',             // Disabled gray
        buttonBackground: '#ddd',     // Light button
        accentRed: '#D63E3E',
        accentRedLight: '#FF6C6C',
        accentBlue: '#007AFF',
        accentBlueAlt: '#2e86de',
        darkGrey: '#333',
        lightGrey: '#F1F1F1',
        bar: '#D9D9D9',
      };
};