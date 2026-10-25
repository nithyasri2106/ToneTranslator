'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, Check, ChevronDown, Clipboard, Clock3, Copy, Feather, History, Moon, RotateCcw, Sparkles, Sun, WandSparkles, X } from 'lucide-react';
import { TONES, type Tone, type RewriteResult } from '@/lib/types';

type HistoryItem = { id: string; message: string; recipient: string; tones: Tone[]; results: RewriteResult[]; createdAt: number };
const examples = [
  { label: 'Work follow-up', text: 'hey just checking if you saw my last email, i really need an answer today because this is holding everything up' },
  { label: 'Set a boundary', text: 'I can’t keep doing your part of the work at the last minute. You need to handle it yourself next time.' },
  { label: 'Reschedule plans', text: 'sorry i cant come tomorrow something came up can we do another day' },
];
const toneDescriptions: Record<Tone, string> = {
  'Professional': 'Clear, polished, work-ready', 'Friendly': 'Warm, approachable, positive', 'Firm / Assertive': 'Direct, confident, respectful', 'Empathetic': 'Considerate and understanding', 'Concise': 'Short, clear, no extra words', 'Formal': 'Structured and traditional', 'Casual / Gen-Z': 'Relaxed, conversational, current',
};

export default function Home() {
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selected, setSelected] = useState<Tone[]>(['Professional', 'Friendly']);
  const [results, setResults] = useState<RewriteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const count = message.length;
  const canSubmit = message.trim().length > 0 && selected.length > 0 && !loading;

  useEffect(() => {
    try {
      setDark(localStorage.getItem('tt-dark') === 'true');
      setHistory(JSON.parse(localStorage.getItem('tt-history') || '[]'));
    } catch { /* Ignore invalid local data. */ }
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('tt-dark', String(dark)); } catch {} }, [dark]);

  const originalWords = useMemo(() => message.trim() ? message.trim().split(/\s+/).length : 0, [message]);

  function toggleTone(tone: Tone) {
    setSelected(current => current.includes(tone) ? current.filter(t => t !== tone) : current.length >= 3 ? current : [...current, tone]);
  }

  async function translate() {
    if (!message.trim()) { setError('Paste a message first so there is something to rewrite.'); return; }
    if (!selected.length) { setError('Select at least one tone.'); return; }
    setLoading(true); setError(''); setResults([]);
    try {
      const response = await fetch('/api/rewrite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, recipient, tones: selected }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to rewrite this message.');
      const nextResults: RewriteResult[] = data.results;
      setResults(nextResults);
      const item: HistoryItem = { id: crypto.randomUUID(), message, recipient, tones: selected, results: nextResults, createdAt: Date.now() };
      setHistory(old => { const next = [item, ...old].slice(0, 5); try { localStorage.setItem('tt-history', JSON.stringify(next)); } catch {} return next; });
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  }

  async function copyText(text: string, id: string) {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1800); }
    catch { setError('Clipboard access was blocked. Select the text and copy it manually.'); }
  }

  function restore(item: HistoryItem) { setMessage(item.message); setRecipient(item.recipient); setSelected(item.tones); setResults(item.results); setShowHistory(false); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  return (
    <main className={dark ? 'dark min-h-screen bg-[#101018] text-slate-100' : 'min-h-screen bg-[#faf9ff] text-[#222039]'}>
      <div className="min-h-screen transition-colors duration-200">
        <header className="sticky top-0 z-20 border-b border-violet-100/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#101018]/85">
          <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
            <a href="#top" className="flex items-center gap-3" aria-label="ToneTranslator home"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none"><Feather size={21}/></span><span className="text-[17px] font-bold tracking-tight">ToneTranslator<span className="text-violet-600">.</span><span className="ml-2 hidden text-xs font-medium text-slate-400 sm:inline">Words, with intention.</span></span></a>
            <div className="flex items-center gap-2"><button onClick={() => setShowHistory(v => !v)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-white/10" aria-label="Recent messages"><History size={17}/><span className="hidden sm:inline">Recent</span>{history.length > 0 && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">{history.length}</span>}</button><button onClick={() => setDark(v => !v)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10" aria-label="Toggle dark mode">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button></div>
          </div>
          {showHistory && <div className="absolute right-5 top-[62px] z-30 w-[min(360px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-[#1b1a29]"><div className="flex items-center justify-between px-2 pb-2 pt-1"><span className="text-sm font-semibold">Recent messages</span><button onClick={() => setShowHistory(false)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10"><X size={16}/></button></div>{history.length ? history.map(item => <button key={item.id} onClick={() => restore(item)} className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-violet-50 dark:hover:bg-white/5"><p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-200">{item.message}</p><p className="mt-1 text-xs text-slate-400">{item.tones.join(' · ')}</p></button>) : <p className="px-3 py-5 text-sm text-slate-400">Your recent rewrites will appear here.</p>}</div>}
        </header>

        <section id="top" className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wide text-violet-700 shadow-sm dark:border-violet-400/20 dark:bg-white/5 dark:text-violet-200"><Sparkles size={14}/> A little more you, in every message</div><h1 className="text-4xl font-bold leading-[1.12] tracking-[-0.045em] sm:text-6xl">Say it the way <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">you mean it.</span></h1><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400 sm:text-lg">Same meaning. Better delivery. Find the right words for any person, moment, or message.</p></div>

          <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-violet-100/80 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191825] sm:p-8">
            <div className="mb-3 flex items-center justify-between"><label htmlFor="message" className="text-sm font-bold">Your original message</label><span className="text-xs text-slate-400">{count.toLocaleString()} / 6,000</span></div>
            <textarea id="message" value={message} onChange={e => { setMessage(e.target.value.slice(0, 6000)); setError(''); }} maxLength={6000} placeholder="Paste the message you want to rewrite…" className="min-h-[170px] w-full resize-y rounded-2xl border border-slate-200 bg-[#fcfbff] p-4 text-[15px] leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70 dark:border-white/10 dark:bg-[#12111c] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-violet-500/10 sm:p-5" />
            <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-slate-400">TRY AN EXAMPLE</span>{examples.map(ex => <button key={ex.label} onClick={() => { setMessage(ex.text); setError(''); }} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">{ex.label}</button>)}</div>
            <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_1.2fr] sm:items-end"><div><label htmlFor="recipient" className="mb-2 block text-sm font-bold">Who is this for? <span className="font-normal text-slate-400">(optional)</span></label><input id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} maxLength={120} placeholder="e.g. my manager, a close friend" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100/70 dark:border-white/10 dark:bg-[#12111c] dark:text-white dark:focus:ring-violet-500/10"/></div><div className="text-xs leading-5 text-slate-400">A little context helps the rewrite feel natural. Your message stays yours.</div></div>
            <div className="mb-3 mt-8 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-sm font-bold">Choose your tone</h2><p className="mt-1 text-xs text-slate-400">Pick up to 3 to compare.</p></div><span className="text-xs font-medium text-violet-600 dark:text-violet-300">{selected.length}/3 selected</span></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{TONES.map(tone => { const active = selected.includes(tone); const disabled = !active && selected.length >= 3; return <button key={tone} disabled={disabled} onClick={() => toggleTone(tone)} className={`group relative min-h-[76px] rounded-2xl border p-3 text-left transition duration-150 ${active ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-400 dark:bg-violet-500/10 dark:ring-violet-500/10' : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40 dark:border-white/10 dark:bg-[#191825] dark:hover:bg-white/5'} ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}><span className={`flex items-center justify-between gap-1 text-[13px] font-bold ${active ? 'text-violet-800 dark:text-violet-200' : 'text-slate-700 dark:text-slate-200'}`}>{tone}{active && <Check size={15} className="shrink-0 text-violet-600"/>}</span><span className="mt-1.5 block text-[11px] leading-4 text-slate-400">{toneDescriptions[tone]}</span></button>; })}</div>
            {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"><X size={17} className="mt-0.5 shrink-0"/>{error}</div>}
            <button onClick={translate} disabled={!canSubmit} className="mt-7 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200/70 transition hover:bg-violet-700 hover:shadow-violet-300/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none dark:shadow-none">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"/> Finding the right words…</> : <><WandSparkles size={18}/> Translate Tone <ArrowRight size={17}/></>}</button>
            <p className="mt-3 text-center text-[11px] text-slate-400">Your meaning stays intact. Only the delivery changes.</p>
          </div>

          {loading && <div className="mx-auto mt-10 max-w-4xl animate-fade-up"><div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"><WandSparkles size={18}/></span><div><p className="text-sm font-bold">Tuning your message</p><p className="text-xs text-slate-400">Keeping your meaning. Adjusting the tone.</p></div></div><div className="grid gap-4 md:grid-cols-2">{selected.map(t => <div key={t} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#191825]"><div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-violet-100 dark:bg-white/10"/><div className="space-y-2">{[1,2,3,4].map(n => <div key={n} className="h-3 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" style={{ width: `${n === 4 ? 48 : 72 + (n % 2) * 18}%`, animationDelay: `${n * 90}ms` }}/>)}</div></div>)}</div></div>}

          {results.length > 0 && <section id="results" className="mx-auto mt-14 max-w-4xl scroll-mt-28 animate-fade-up"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-violet-600 dark:text-violet-300"><Sparkles size={14}/> Your rewrites</div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Different tone. Same you.</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose the version that feels right, or try another tone.</p></div><button onClick={() => { setResults([]); setError(''); document.getElementById('message')?.focus(); }} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"><RotateCcw size={15}/> Try again</button></div>
            <div className="grid gap-4 md:grid-cols-2">{results.map((result, index) => <article key={`${result.tone}-${index}`} className="animate-fade-up rounded-[24px] border border-violet-100/80 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#191825] sm:p-6" style={{ animationDelay: `${index * 90}ms` }}><div className="mb-4 flex items-center justify-between gap-3"><span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">{result.tone}</span><span className="text-xs text-slate-400">{result.text.trim().split(/\s+/).length} words</span></div><p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-800 dark:text-slate-100">{result.text}</p><div className="mt-5 rounded-xl bg-[#f8f7fc] p-3.5 dark:bg-white/[.04]"><p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><Sparkles size={12}/> What changed</p><p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{result.explanation}</p></div><button onClick={() => copyText(result.text, `${result.tone}-${index}`)} className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${copied === `${result.tone}-${index}` ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'}`}>{copied === `${result.tone}-${index}` ? <Check size={16}/> : <Copy size={16}/>}{copied === `${result.tone}-${index}` ? 'Copied to clipboard' : 'Copy message'}</button></article>)}</div>
            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[.03]"><p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-300">ORIGINAL MESSAGE</p><p className="whitespace-pre-wrap text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p><div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><ArrowDown size={13}/> {originalWords} original words · Meaning preserved, wording adjusted</div></div>
          </section>}

          {!results.length && !loading && <div className="mx-auto mt-12 max-w-4xl"><div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-white/10"/>Made for real conversations<span className="h-px flex-1 bg-slate-200 dark:bg-white/10"/></div><div className="grid gap-4 sm:grid-cols-3">{[{icon:<Feather size={18}/>,title:'Meaning comes first',desc:'Your facts and intent stay intact. Only the wording shifts.'},{icon:<Clock3 size={18}/>,title:'Less second-guessing',desc:'Compare tones side by side and choose what feels right.'},{icon:<Clipboard size={18}/>,title:'Ready to send',desc:'Copy a clean rewrite in one click and get on with your day.'}].map(item => <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[.03]"><span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">{item.icon}</span><h3 className="text-sm font-bold">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.desc}</p></div>)}</div></div>}
        </section>
        <footer className="border-t border-slate-200/70 dark:border-white/10"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:px-8"><span className="font-semibold text-slate-500 dark:text-slate-300">ToneTranslator<span className="text-violet-500">.</span></span><span>Clearer words. Better conversations.</span><span>Made for the moments when wording matters.</span></div></footer>
      </div>
    </main>
  );
}
