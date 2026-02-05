'use client';

import { Calendar, Clock, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface ServiceInfoProps {
  serviceName: string;
  serviceDescription?: string;
  providerName: string;
  slotDuration: number;
  // Optional props for confirm page
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
}

export function ServiceInfo({
  serviceName,
  serviceDescription,
  providerName,
  slotDuration,
  startTime,
  endTime: _endTime,
  timezone,
}: ServiceInfoProps) {
  const showBookingDetails = startTime && timezone;
  const dateStr = startTime ? format(startTime, 'EEEE, MMMM d, yyyy') : '';
  const timeStr = startTime && timezone ? formatInTimeZone(startTime, timezone, 'h:mm a zzz') : '';

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="text-muted-foreground text-xs tracking-wide uppercase">{providerName}</div>
        <h1 className="text-xl leading-snug font-semibold text-balance">{serviceName}</h1>
        {/* Description */}
        {serviceDescription && (
          <p className="text-muted-foreground text-sm">{serviceDescription}</p>
        )}
      </div>

      {/* Duration - shown on both pages */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        <span>{slotDuration} min</span>
      </div>

      {/* Show date/time only on confirm page */}
      {showBookingDetails && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-muted-foreground h-4 w-4" />
            <span>{dateStr}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span>{timeStr}</span>
          </div>

          {/* Timezone - shown only on confirm page */}
          {timezone && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="text-muted-foreground h-4 w-4" />
              <span>{timezone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
