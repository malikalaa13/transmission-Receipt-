import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { listCustomers } from '../../services/dataService';
import { Input } from '../ui';
export default function CustomerAutocomplete({ value, onChange, onSelect }) {
  const [items, setItems] = useState([]); const [open, setOpen] = useState(false);
  useEffect(() => { let active = true; if (!value || value.length < 2) { setItems([]); return; } listCustomers(value).then(r => active && setItems(r)); return () => { active = false; }; }, [value]);
  return <div className="relative"><div className="relative"><Input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }} onFocus={() => value && setOpen(true)} placeholder="Search customer name or phone"/><Search size={17} className="absolute right-3 top-3 text-slate-400"/></div>{open && items.length > 0 && <div className="autocomplete-menu">{items.map(c => <button key={c.id} type="button" onMouseDown={() => { onSelect(c); setOpen(false); }} className="autocomplete-item"><span className="font-bold">{c.name}</span><span className="text-xs text-slate-400">{c.phone}</span></button>)}</div>}</div>;
}
