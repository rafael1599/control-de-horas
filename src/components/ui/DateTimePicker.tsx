import * as React from "react"
import { format, subHours, isBefore, isAfter, startOfDay, endOfDay } from "date-fns"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "./input"

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
  const now = new Date();
  const minEntryTime = subHours(now, 23);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (date && newTime) {
      const [hours, minutes] = newTime.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      if (isBefore(newDate, minEntryTime) || isAfter(newDate, now)) {
        // Si la nueva fecha/hora está fuera del rango, no la actualizamos.
        // Opcionalmente, podrías mostrar un toast de advertencia aquí.
        return;
      }
      setDate(newDate);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const selectedDate = new Date(newDate);
      if (date) {
        selectedDate.setHours(date.getHours(), date.getMinutes());
      }

      // Ajusta la hora si la fecha seleccionada cae fuera de los límites permitidos
      if (isBefore(selectedDate, minEntryTime)) {
        setDate(minEntryTime);
      } else if (isAfter(selectedDate, now)) {
        setDate(now);
      } else {
        setDate(selectedDate);
      }
    } else {
      setDate(newDate);
    }
  }

  const getTimeProps = () => {
    if (!date) return {};

    const selectedDay = startOfDay(date);
    const minEntryDay = startOfDay(minEntryTime);
    const nowDay = startOfDay(now);

    let minTime: string | undefined = undefined;
    let maxTime: string | undefined = undefined;

    if (selectedDay.getTime() === minEntryDay.getTime()) {
      minTime = format(minEntryTime, 'HH:mm');
    }

    if (selectedDay.getTime() === nowDay.getTime()) {
      maxTime = format(now, 'HH:mm');
    }
    
    return { min: minTime, max: maxTime };
  }


  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateChange}
        disabled={(day) => isBefore(day, startOfDay(minEntryTime)) || isAfter(day, endOfDay(now))}
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
          {...getTimeProps()}
        />
      </div>
    </div>
  )
}