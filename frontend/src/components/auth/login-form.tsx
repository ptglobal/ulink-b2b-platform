'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Globe, Shield } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { AuthError } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}

function LoginFormInner() {
  const t = useTranslations('auth');
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();

  const reason = search.get('reason');
  const reasonBanner =
    reason === 'password-changed'
      ? { kind: 'success' as const, key: 'loginAfterPasswordChange' }
      : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = t('emailRequired');
    else if (!EMAIL_RE.test(email)) next.email = t('emailInvalid');
    if (!password) next.password = t('passwordRequired');
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      const nextRaw = search.get('next');
      const nextSafe =
        typeof nextRaw === 'string' &&
        nextRaw.startsWith('/') &&
        !nextRaw.startsWith('//') &&
        !nextRaw.startsWith('/\\')
          ? nextRaw
          : '/';
      router.push(nextSafe);
      router.refresh();
    } catch (err) {
      if (err instanceof AuthError && err.code === 'account_locked') {
        setFormError(t('accountLockedContactAdmin'));
      } else if (err instanceof AuthError && err.code === 'network_error') {
        setFormError(t('errorNetwork'));
      } else {
        setFormError(t('errorInvalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    'w-full rounded-xl border bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal hover:bg-white focus:bg-white focus:border-[#0D4397] focus:ring-4 focus:ring-[#0D4397]/10';

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Top bar: Language Switcher */}
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200/80">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>Tiếng Việt</span>
          </div>
        </div>

        {/* Tab Headers: Đăng nhập vs Đăng ký tài khoản */}
        <div className="flex items-center border-b border-slate-100 mb-6 relative">
          <Link
            href="/login"
            className="flex-1 py-3 text-center text-sm font-bold text-[#0D4397] relative border-b-2 border-[#0D4397] transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="flex-1 py-3 text-center text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
          >
            Đăng ký tài khoản
          </Link>
        </div>

        {/* H2 Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Chào mừng bạn trở lại!
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed sm:text-sm">
            Vui lòng nhập thông tin để đăng nhập hệ thống B2B của ULINK INDUSTRIES.
          </p>
        </div>

        {reasonBanner && (
          <div
            role="status"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-800"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span className="font-medium">{t(reasonBanner.key)}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          {formError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 font-medium leading-relaxed">
              {formError}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Email Doanh Nghiệp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0D4397]" aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vd: contact@company.com"
                aria-invalid={!!fieldErrors.email}
                className={cn(inputBase, fieldErrors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200')}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs font-medium text-rose-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-[#0D4397] transition-colors hover:text-[#0a387e] hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                aria-invalid={!!fieldErrors.password}
                className={cn(inputBase, 'pr-11', fieldErrors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-xs font-medium text-rose-500">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D4397] py-3.5 text-sm font-bold text-white shadow-md shadow-[#0D4397]/20 transition-all duration-200 hover:bg-[#0a387e] hover:shadow-lg hover:shadow-[#0D4397]/30 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Bạn gặp khó khăn khi đăng nhập? Vui lòng liên hệ hotline <a href="tel:19006868" className="font-bold text-[#0D4397] hover:underline">1900 6868</a> để được hỗ trợ.
        </p>
      </div>
    </div>
  );
}
