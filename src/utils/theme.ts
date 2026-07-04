const STORAGE_KEY = "theme";

export type Theme = "dark" | "light";

export function applyTheme(theme: Theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

export function saveTheme(theme: Theme) {
    localStorage.setItem(STORAGE_KEY, theme);
}

export function getTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "dark" || saved === "light") {
        return saved;
    }

    return "dark";
}

export function setTheme(theme: Theme) {
    applyTheme(theme);
    saveTheme(theme);
}

export function toggleTheme() {
    const current = getTheme();

    const next = current === "dark"
        ? "light"
        : "dark";

    setTheme(next);

    return next;
}