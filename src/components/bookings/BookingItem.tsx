'use client';

import { BookingStatus } from '@prisma/client';
import { Calendar, Clock, User, FileText, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { BookingWithDetails } from '@/lib/types/booking';

interface BookingItemProps {
  booking: BookingWithDetails;
}

const formatTime = (date: Date) => {
  return format(date, 'h:mm a');
};

const formatDate = (date: Date) => {
  return format(date, 'EEE, MMM d, yyyy');
};

const getStatusBadgeVariant = (
  status: BookingStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'CONFIRMED':
      return 'default';
    case 'COMPLETED':
      return 'secondary';
    case 'CANCELLED':
      return 'destructive';
    case 'NO_SHOW':
      return 'outline';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: BookingStatus) => {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'NO_SHOW':
      return 'No Show';
    default:
      return status;
  }
};

export function BookingItem({ booking }: BookingItemProps) {
  const invitee = booking.participants.find((p) => p.role === 'INVITEE');
  const isPast = new Date(booking.startTime) < new Date();

  return (
    <div
      className={cn(
        'bg-card rounded-lg border border-l-4 p-6 transition-shadow hover:shadow-md',
        booking.status === 'CANCELLED'
          ? 'border-l-destructive/60'
          : booking.status === 'COMPLETED'
            ? 'border-l-muted-foreground/60'
            : isPast
              ? 'border-l-warning/60'
              : 'border-l-primary/60'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Date and Time */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="font-semibold">{formatDate(booking.startTime)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-sm">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </span>
            </div>
          </div>

          {/* Invitee Info */}
          {invitee && (
            <div className="mb-3 flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">{invitee.name || 'Unknown'}</span>
              {invitee.email && (
                <span className="text-muted-foreground text-sm">({invitee.email})</span>
              )}
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="mb-3 flex items-start gap-2">
              <FileText className="text-muted-foreground mt-0.5 h-4 w-4" />
              <p className="text-muted-foreground line-clamp-2 text-sm">{booking.notes}</p>
            </div>
          )}

          {/* Service Link */}
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5" />
            <span>{booking.service.name}</span>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={getStatusBadgeVariant(booking.status)}>
          {getStatusLabel(booking.status)}
        </Badge>
      </div>
    </div>
  );
}
