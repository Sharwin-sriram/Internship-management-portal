import { IconType } from 'react-icons';
import { cn } from '@/lib/utils';

export interface RoleCardProps {
  name: string;
  description: string;
  userCount: number;
  icon: IconType;
  color: 'indigo' | 'emerald' | 'sky' | 'amber';
  loading?: boolean;
}

const colorMap = {
  indigo: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950',
    icon: 'text-indigo-600 dark:text-indigo-400',
    count: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-100 dark:border-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-700',
  },
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950',
    icon: 'text-emerald-600 dark:text-emerald-400',
    count: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  sky: {
    iconBg: 'bg-sky-50 dark:bg-sky-950',
    icon: 'text-sky-600 dark:text-sky-400',
    count: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-100 dark:border-sky-900 hover:border-sky-300 dark:hover:border-sky-700',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-950',
    icon: 'text-amber-600 dark:text-amber-400',
    count: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700',
  },
};

export default function RoleCard({ name, description, userCount, icon: Icon, color, loading }: RoleCardProps) {
  const c = colorMap[color];

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 mb-4" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-4" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default',
        c.border
      )}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', c.iconBg)}>
        <Icon className={cn('text-xl', c.icon)} />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{name}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">Total users</span>
        <span className={cn('text-sm font-bold', c.count)}>{userCount.toLocaleString()}</span>
      </div>
    </div>
  );
}
