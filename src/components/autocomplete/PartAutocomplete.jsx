import { useEffect, useState } from 'react';
import { searchParts } from '../../services/dataService';
import { Input } from '../ui';
export default function PartAutocomplete({ value, onChange, onSelect }) {
  const [items, setItems] = useState([]); const [open, setOpen] = useState(false);
  useEffect(() => { let active = true; if (!value || value.length < 2) { setItems([]); return; } searchParts(value).then(r => active && setItems(r)); return () => { active = false; }; }, [value]);
  return <div className="relative"><Input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }} onFocus={() => value && setOpen(true)} placeholder="Description / service"/>{open && items.length > 0 && <div className="autocomplete-menu">{items.map(p => <button key={p.id} type="button" onMouseDown={() => { onSelect(p); setOpen(false); }} className="autocomplete-item"><span>{p.name}</span></button>)}</div>}</div>;
}
