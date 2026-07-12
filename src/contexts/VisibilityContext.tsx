import { createContext, useContext, useEffect, useState } from 'react';

type VisibilityContextType = {
    showValues: boolean;
    toggleValues: () => void;
};

const VisibilityContext = createContext<VisibilityContextType | null>(null);

export const VisibilityProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [showValues, setShowValues] = useState(() => {
        return sessionStorage.getItem('showValues') !== 'false';
    });

    useEffect(() => {
        sessionStorage.setItem('showValues', String(showValues));
    }, [showValues]);

    const toggleValues = () => setShowValues(prev => !prev);

    return (
        <VisibilityContext.Provider
            value={{
                showValues,
                toggleValues,
            }}
        >
            {children}
        </VisibilityContext.Provider>
    );
};

export const useVisibility = () => {
    const ctx = useContext(VisibilityContext);

    if (!ctx)
        throw new Error(
            'useVisibility deve ser usado dentro de VisibilityProvider'
        );

    return ctx;
};