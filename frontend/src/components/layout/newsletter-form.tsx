'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Loader2 } from 'lucide-react';

export function NewsletterForm() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'conflict' | 'invalid'>('idle');
  const [message, setMessage] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus('invalid');
      setMessage(t('newsletterInvalid'));
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setStatus('invalid');
      setMessage(t('newsletterInvalid'));
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });

      const payload = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t('newsletterSuccess'));
        setEmail(''); // Auto-clear input field upon success
      } else {
        if (response.status === 409) {
          setStatus('conflict');
          setMessage(t('newsletterConflict'));
        } else {
          setStatus('error');
          setMessage(payload?.message || t('newsletterError'));
        }
      }
    } catch (err) {
      console.error('Newsletter submit failed:', err);
      setStatus('error');
      setMessage(t('newsletterError'));
    }
  }

  return (
    <div className="mt-2">
      <form onSubmit={onSubmit} className="flex items-stretch overflow-hidden rounded-lg bg-white" noValidate>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          placeholder={t('newsletterPlaceholder')}
          className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex h-9 w-9 shrink-0 items-center justify-center bg-transparent text-brand transition-colors hover:text-brand-strong disabled:opacity-60"
          aria-label={t('newsletterSubmit')}
        >
          {status === 'loading' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </form>

      {message && (
        <p
          className={`mt-1.5 text-[11px] leading-normal ${
            status === 'success'
              ? 'text-green-400'
              : status === 'invalid' || status === 'conflict' || status === 'error'
              ? 'text-red-400'
              : 'text-white/60'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
