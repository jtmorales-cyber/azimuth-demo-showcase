'use client';

interface ToolTitleProps {
  name: string;
}

// Amber tool-name banner that sits at the top of every showcase card.
// Identifies which tool the visitor is currently inside as they swipe/tap
// through the BAB sequence.
export default function ToolTitle({ name }: ToolTitleProps) {
  return (
    <div
      className="font-satoshi"
      style={{
        color: 'var(--amber-core)',
        fontSize: 'var(--text-h3)',
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}
    >
      {name}
    </div>
  );
}
