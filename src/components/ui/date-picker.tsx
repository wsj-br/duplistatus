'use client';

import * as React from 'react';
import DatePickerLib from 'react-datepicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

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

  // Sync with external value changes
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

  // Handle date selection from calendar
  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setSelectedDate(date);
      setInputValue(dateString);
      onChange(dateString);
      // Close the popup when a date is selected
      setIsOpen(false);
    } else {
      setSelectedDate(null);
      setInputValue('');
      onChange('');
      setIsOpen(false);
    }
  };

  // Handle manual input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate date format (YYYY-MM-DD)
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

  // Handle input blur - validate and format
  const handleInputBlur = () => {
    if (inputValue && !/^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
      // Try to parse and reformat
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
        // Invalid date, clear it
        setInputValue('');
        setSelectedDate(null);
        onChange('');
      }
    }
  };

  // Handle calendar icon click
  const handleIconClick = (e: React.MouseEvent) => {
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
        customInput={
          <div className="relative">
            <Input
              id={id}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="pr-10"
              disabled={disabled}
            />
            <div
              className="absolute right-0 top-0 h-full flex items-center pr-3 cursor-pointer z-10 pointer-events-auto"
              onClick={handleIconClick}
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        }
        popperClassName="react-datepicker-popper"
        popperPlacement="bottom-end"
        wrapperClassName="react-datepicker-wrapper"
      />
    </div>
  );
}
