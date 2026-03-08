import { ChevronDown } from "lucide-react";

const Select = ({ value, onChange, options, className = "", placeholder = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full text-sm px-4 py-2.5 border border-stone-200 bg-white text-stone-700 hover:border-stone-300 focus:outline-none focus:border-[#B8935C] transition-colors cursor-pointer"
        placeholder={placeholder}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400 pointer-events-none" />
    </div>
  );
}

export default Select;