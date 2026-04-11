'use client';

interface FeatureRowProps {
  title: string;
  description?: string;
}

/**
 * Horizontal feature item for showcase carousels.
 * Title in Inter 500 (cyan-struct), description in Inter 400 (silver).
 * Compact spacing for lists of 3-4 features.
 */
export default function FeatureRow({ title, description }: FeatureRowProps) {
  return (
    <div className="flex items-start gap-sm py-xs">
      {/* Bullet indicator */}
      <div
        className="flex-shrink-0 rounded-full mt-1"
        style={{
          width: 6,
          height: 6,
          backgroundColor: 'var(--cyan-struct)',
          marginTop: 8,
        }}
      />
      <div>
        <span
          className="font-inter font-medium"
          style={{
            fontSize: 'var(--text-body)',
            color: 'var(--cyan-struct)',
          }}
        >
          {title}
        </span>
        {description && (
          <span
            className="font-inter ml-xs"
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--silver)',
            }}
          >
            {' '}{description}
          </span>
        )}
      </div>
    </div>
  );
}
