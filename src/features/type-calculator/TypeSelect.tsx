import { PokemonTypeName, POKEMON_TYPE_STYLES, getTypeStyle } from '@/styles/typeColors';
import { ALL_POKEMON_TYPES } from '@/services/pokeapi/typeEffectiveness';
import { cn } from '@/lib/utils';

export interface TypeSelectProps {
  id: string;
  label: string;
  value: PokemonTypeName | 'all' | '';
  onChange: (value: string) => void;
  disabledValue?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  allowAll?: boolean;
  allLabel?: string;
  helperText?: string;
  className?: string;
}

export function TypeSelect({
  id,
  label,
  value,
  onChange,
  disabledValue,
  allowEmpty = false,
  emptyLabel = 'None (Single Type)',
  allowAll = false,
  allLabel = 'All Attacking Types (Overview)',
  helperText,
  className,
}: TypeSelectProps) {
  const currentTypeStyle =
    Boolean(value) && value !== 'all'
      ? getTypeStyle(value as PokemonTypeName)
      : null;

  return (
    <div className={cn('flex flex-col space-y-1.5', className)}>
      <label
        htmlFor={id}
        className="text-xs sm:text-sm font-semibold tracking-tight text-foreground flex items-center justify-between"
      >
        <span>{label}</span>
        {currentTypeStyle && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
              currentTypeStyle.badgeBg,
              currentTypeStyle.badgeText,
              currentTypeStyle.badgeBorder
            )}
            aria-hidden="true"
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: currentTypeStyle.bgHex }}
            />
            {currentTypeStyle.label}
          </span>
        )}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className={cn(
            'w-full h-11 px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground shadow-2xs font-medium cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background transition-colors',
            currentTypeStyle && 'border-primary/40'
          )}
        >
          {allowAll && (
            <option value="all">
              {allLabel}
            </option>
          )}

          {allowEmpty && (
            <option value="">
              {emptyLabel}
            </option>
          )}

          {ALL_POKEMON_TYPES.map((typeKey) => {
            const style = POKEMON_TYPE_STYLES[typeKey];
            const isDisabled = Boolean(disabledValue && disabledValue.toLowerCase() === typeKey);
            return (
              <option key={typeKey} value={typeKey} disabled={isDisabled}>
                {style.label} {isDisabled ? '(Already selected)' : ''}
              </option>
            );
          })}
        </select>
      </div>

      {helperText && (
        <span className="text-[11px] text-muted-foreground leading-normal">
          {helperText}
        </span>
      )}
    </div>
  );
}
