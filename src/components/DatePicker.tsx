"use client";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const goDay = (offset: number) => {
    const d = new Date(value);
    d.setDate(d.getDate() + offset);
    onChange(d.toISOString().split("T")[0]);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => goDay(-1)}
        className="px-3 py-2 rounded-lg bg-card border border-border hover:bg-card-hover text-gray-300 transition-colors"
      >
        &lt;
      </button>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-card border border-border text-white text-sm focus:outline-none focus:border-accent"
      />
      <button
        onClick={() => goDay(1)}
        className="px-3 py-2 rounded-lg bg-card border border-border hover:bg-card-hover text-gray-300 transition-colors"
      >
        &gt;
      </button>
      <button
        onClick={() => onChange(new Date().toISOString().split("T")[0])}
        className="px-3 py-2 rounded-lg bg-accent/20 border border-accent/30 text-accent text-sm hover:bg-accent/30 transition-colors"
      >
        Today
      </button>
    </div>
  );
}
