import toast from 'react-hot-toast';

export const showWarning = (message: string) => {
    toast(message, {
        id: 'warning-toast',
        icon: '⚠️',
        style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-warning)',
        },
    });
}