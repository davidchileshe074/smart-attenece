'use client';

import Link from 'next/link';
import { AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

type LoadingStateProps = {
  title: string;
  description: string;
  compact?: boolean;
};

type ErrorStateProps = {
  title?: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function LoadingState({ title, description, compact = false }: LoadingStateProps) {
  return (
    <div className={`card text-center ${compact ? 'py-10' : 'py-16'}`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
      <div className="mt-6 h-1 w-40 mx-auto overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/2 bg-primary animate-[loading_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, actionHref, actionLabel, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-red-800">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {onRetry && (
              <button type="button" onClick={onRetry} className="btn-secondary gap-2 border-red-200 text-red-700 hover:bg-red-100">
                Try again
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            {actionHref && actionLabel && (
              <Link href={actionHref} className="btn-primary gap-2 bg-red-700 text-white hover:bg-red-800">
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
