import * as React from "react";
import { format, setHours, setMinutes, getHours, getMinutes, getSeconds, setSeconds, isBefore, isAfter, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DateTimePicker({ date, setDate, minDate, maxDate, className }: DateTimePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!selectedDay) {
      setDate(undefined);
      return;
    }
    
    const timeSource = date || new Date();

    let newDate = setHours(selectedDay, getHours(timeSource));
    newDate = setMinutes(newDate, getMinutes(timeSource));
    newDate = setSeconds(newDate, getSeconds(timeSource));

    if (minDate && isBefore(newDate, minDate)) {
      newDate = minDate;
    }
    if (maxDate && isAfter(newDate, maxDate)) {
      newDate = maxDate;
    }

    setDate(newDate);
    setIsPopoverOpen(false);
  };

  const handleTimeChange = (value: string, unit: 'hours' | 'minutes') => {
    if (!date) return;

    let newDate = new Date(date);

    if (unit === 'hours') {
      newDate = setHours(newDate, parseInt(value, 10));
    } else if (unit === 'minutes') {
      newDate = setMinutes(newDate, parseInt(value, 10));
    }

    let finalDate = newDate;
    if (minDate && isBefore(finalDate, minDate)) {
      finalDate = minDate;
    }
    if (maxDate && isAfter(finalDate, maxDate)) {
      finalDate = maxDate;
    }

    setDate(finalDate);
  };
  
  const handleDisabled = React.useCallback((day: Date) => {
      if (minDate && isBefore(startOfDay(day), startOfDay(minDate))) {
        return true;
      }
      if (maxDate && isAfter(startOfDay(day), startOfDay(maxDate))) {
        return true;
      }
      return false;
    }, [minDate, maxDate]);

  const hours = date ? getHours(date) : 0; // Use 24-hour format directly

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={handleDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Select value={hours.toString()} onValueChange={(val) => handleTimeChange(val, 'hours')}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }, (_, i) => i).map(h => <SelectItem key={h} value={h.toString()}>{h.toString().padStart(2, '0')}</SelectItem>)}
        </SelectContent>
      </Select>
      <span>:</span>
      <Select value={date ? format(date, "mm") : "00"} onValueChange={(val) => handleTimeChange(val, 'minutes')}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}