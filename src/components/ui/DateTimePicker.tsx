import * as React from "react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "./input"

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (date && newTime) {
      const [hours, minutes] = newTime.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setDate(newDate);
    }
  };
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate && date) {
        newDate.setHours(date.getHours(), date.getMinutes());
    }
    setDate(newDate);
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateChange}
      />
      <div className="w-full px-4 pb-2">
        <label htmlFor="time-input" className="block text-sm font-medium text-gray-700 mb-1">
          Hora de entrada:
        </label>
        <Input
          id="time-input"
          type="time"
          className="w-full"
          onChange={handleTimeChange}
          value={date ? format(date, 'HH:mm') : ''}
        />
      </div>
    </div>
  )
}