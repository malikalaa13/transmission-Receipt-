import { forwardRef } from 'react';
export function Field({ label, children, className = '' }) { return <label className={`block ${className}`}><span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>; }
export const Input = forwardRef(function Input(props, ref) { return <input ref={ref} {...props} className={`input ${props.className || ''}`} />; });
export function Textarea(props) { return <textarea {...props} className={`input min-h-24 resize-y ${props.className || ''}`} />; }
export function Section({ title, children, actions }) { return <section className="card overflow-visible"><div className="flex items-center justify-between border-b px-5 py-4"><h2 className="text-sm font-black tracking-wide">{title}</h2>{actions}</div><div className="p-5">{children}</div></section>; }
