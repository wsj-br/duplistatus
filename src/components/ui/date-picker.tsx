'use client';

import * as React from 'react';
import DatePickerLib from 'react-datepicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

type DatePickerInputProps = {
  value?: string;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  className?: string;
  title?: string;
  onIconClick?: React.MouseEventHandler<HTMLDivElement>;
};

function stripDatePickerTitles(root: ParentNode | null): void {
  if (!root) {
    return;
  }
  root.querySelectorAll('[title]').forEach((element) => {
    element.removeAttribute('title');
  });
}

const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput(
    {
      value,
      onClick,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      disabled,
      id,
      placeholder,
      className,
      title: _title,
      onIconClick,
    },
    ref
  ) {
    return (
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type="text"
          value={value ?? ''}
          onClick={onClick}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn('pr-10', className)}
          disabled={disabled}
          autoComplete="off"
        />
        <div
          className="absolute right-0 top-0 z-10 flex h-full cursor-pointer items-center pr-3 pointer-events-auto"
          onClick={onIconClick}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }
);

export function DatePicker({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  id,
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    value ? new Date(value + 'T00:00:00') : null
  );
  const [inputValue, setInputValue] = React.useState(value || '');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setInputValue(value);
      }
    } else {
      setSelectedDate(null);
      setInputValue('');
    }
  }, [value]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      document.querySelectorAll('.react-datepicker-popper').forEach((popper) => {
        stripDatePickerTitles(popper);
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setSelectedDate(date);
      setInputValue(dateString);
      onChange(dateString);
      setIsOpen(false);
    } else {
      setSelectedDate(null);
      setInputValue('');
      onChange('');
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue === '' || /^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
      if (newValue) {
        const parsed = new Date(newValue + 'T00:00:00');
        if (!isNaN(parsed.getTime())) {
          setSelectedDate(parsed);
        }
      } else {
        setSelectedDate(null);
      }
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    if (inputValue && !/^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
      const parsed = new Date(inputValue);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${day}`;
        setInputValue(formatted);
        setSelectedDate(parsed);
        onChange(formatted);
      } else {
        setInputValue('');
        setSelectedDate(null);
        onChange('');
      }
    }
  };

  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <DatePickerLib
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        disabled={disabled}
        open={isOpen}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        onClickOutside={() => setIsOpen(false)}
        showPopperArrow={false}
        previousMonthAriaLabel="Previous month"
        nextMonthAriaLabel="Next month"
        previousMonthButtonLabel=""
        nextMonthButtonLabel=""
        customInput={
          <DatePickerInput
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            onIconClick={handleIconClick}
          />
        }
        popperClassName="react-datepicker-popper"
        popperPlacement="bottom-end"
        wrapperClassName="react-datepicker-wrapper"
      />
    </div>
  );
}
