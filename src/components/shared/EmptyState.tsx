import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
    <div className="bg-card/30 backdrop-blur-sm rounded-lg p-8 text-center border border-white/5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
            <Icon size={22} className="text-muted-foreground" />
        </div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">{description}</p>}
        {action && (
            <button
                onClick={action.onClick}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-display uppercase tracking-wide hover:brightness-110 transition-all"
            >
                {action.label}
            </button>
        )}
    </div>
);
