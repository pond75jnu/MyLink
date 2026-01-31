import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from 'react';

interface DropdownItem {
  key: string;
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

function Dropdown({ trigger, items, align = 'left', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    const enabledItems = items.filter((item) => !item.disabled);
    const enabledIndices = items
      .map((item, index) => (item.disabled ? -1 : index))
      .filter((i) => i !== -1);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (focusedIndex === -1) {
          setFocusedIndex(enabledIndices[0] ?? -1);
        } else {
          const currentPos = enabledIndices.indexOf(focusedIndex);
          const nextPos = (currentPos + 1) % enabledItems.length;
          setFocusedIndex(enabledIndices[nextPos]);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusedIndex === -1) {
          setFocusedIndex(enabledIndices[enabledIndices.length - 1] ?? -1);
        } else {
          const currentPos = enabledIndices.indexOf(focusedIndex);
          const prevPos = (currentPos - 1 + enabledItems.length) % enabledItems.length;
          setFocusedIndex(enabledIndices[prevPos]);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && !items[focusedIndex].disabled) {
          items[focusedIndex].onClick?.();
          closeDropdown();
        }
        break;
      case 'Tab':
        closeDropdown();
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`} onKeyDown={handleKeyDown}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </div>
      {isOpen ? (
        <div
          className={`
            absolute z-50 mt-2 min-w-48 bg-white rounded-lg shadow-lg border border-gray-200
            py-1 transform transition-all duration-200 origin-top
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick?.();
                  closeDropdown();
                }
              }}
              disabled={item.disabled}
              role="menuitem"
              tabIndex={-1}
              className={`
                w-full text-left px-4 py-2 text-sm transition-colors
                ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : item.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }
                ${focusedIndex === index ? 'bg-gray-100' : ''}
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { Dropdown };
export type { DropdownProps, DropdownItem };
