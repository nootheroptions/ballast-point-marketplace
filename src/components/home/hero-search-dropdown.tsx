'use client';

import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface HeroSearchDropdownSection {
  title?: string;
  items: DropdownItem[];
}

interface CustomHeroSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sections: HeroSearchDropdownSection[];
  disabled?: boolean;
  className?: string;
  alignToSearchBar?: boolean;
  positionBelow?: boolean;
}

export function HeroSearchCustomDropdown({
  value,
  onChange,
  placeholder = 'Select an option',
  sections,
  disabled = false,
  className = '',
  alignToSearchBar = false,
  positionBelow = false,
}: CustomHeroSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  // Find selected item across all sections
  const selectedItem = sections
    .flatMap((section) => section.items)
    .find((item) => item.id === value);
  const displayText = selectedItem?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInTrigger = dropdownRef.current?.contains(target);
      const isInPanel = dropdownPanelRef.current?.contains(target);

      if (!isInTrigger && !isInPanel) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (itemId: string) => {
    onChange(itemId);
    setIsOpen(false);
  };

  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const searchBar = buttonRef.current.closest('.search-bar-container');
    const anchorEl = searchBar ?? buttonRef.current;
    const anchorRect = anchorEl.getBoundingClientRect();

    // Position dropdown above or below based on positionBelow prop
    const top = positionBelow ? anchorRect.bottom + 8 : anchorRect.top - 8;

    if (alignToSearchBar) {
      // Left aligns to the entire search bar container
      setDropdownPosition({
        left: anchorRect.left,
        top,
        width: anchorRect.width,
      });
    } else {
      // Left aligns to the dropdown's relative container
      const parentSection = buttonRef.current.closest('.relative');
      const sectionRect = parentSection?.getBoundingClientRect();
      setDropdownPosition({
        left: sectionRect?.left ?? anchorRect.left,
        top,
        width: sectionRect?.width ?? anchorRect.width,
      });
    }
  }, [alignToSearchBar, positionBelow]);

  useEffect(() => {
    if (!isOpen) return;

    function handleReposition() {
      updateDropdownPosition();
    }

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  return (
    <div ref={dropdownRef} className={`relative flex-1 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (disabled) return;
          if (!isOpen) updateDropdownPosition();
          setIsOpen(!isOpen);
        }}
        className={`flex w-full items-center justify-between text-left ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
        disabled={disabled}
      >
        <span className="text-base text-gray-900">{displayText}</span>
        <ChevronDown className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400" />
      </button>

      {isOpen && !disabled && dropdownPosition && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
              <div
                ref={dropdownPanelRef}
                style={{
                  position: 'absolute',
                  ...dropdownPosition,
                  pointerEvents: 'auto',
                }}
                className={`max-h-[500px] overflow-y-auto rounded-2xl border border-gray-100 bg-white py-3 shadow-2xl ${positionBelow ? '' : '-translate-y-full'}`}
              >
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {/* Section Header */}
                    {section.title && (
                      <div className="px-4 pt-3 pb-1">
                        <h3 className="text-base font-bold text-gray-900">{section.title}</h3>
                      </div>
                    )}

                    {/* Section Items */}
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.id)}
                          className="flex w-full items-center gap-3 px-4 py-2 transition-colors hover:bg-gray-50"
                        >
                          {Icon && (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200">
                              <Icon className="text-primary h-5 w-5" />
                            </div>
                          )}
                          <span className="text-base text-gray-900">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
