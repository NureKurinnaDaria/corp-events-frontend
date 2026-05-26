import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/api$/, "");

let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket || !globalSocket.connected) {
    globalSocket = io(`${SOCKET_URL}/events`, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return globalSocket;
}

// Типи подій

export interface EventStatusChangedPayload {
  eventId: string;
  status: string;
  title: string;
}

export interface ParticipantsUpdatedPayload {
  eventId: string;
  participantsCount: number;
}

export interface NewNotificationPayload {
  id: string;
  title: string;
  message: string;
  type: string;
  eventId: string | null;
  createdAt: string;
  isRead: boolean;
}

// Хук для сторінки деталей події
interface UseEventSocketOptions {
  eventId: string | undefined;
  onStatusChanged?: (payload: EventStatusChangedPayload) => void;
  onParticipantsUpdated?: (payload: ParticipantsUpdatedPayload) => void;
}

export function useEventSocket({
  eventId,
  onStatusChanged,
  onParticipantsUpdated,
}: UseEventSocketOptions) {
  const onStatusChangedRef = useRef(onStatusChanged);
  const onParticipantsUpdatedRef = useRef(onParticipantsUpdated);
  onStatusChangedRef.current = onStatusChanged;
  onParticipantsUpdatedRef.current = onParticipantsUpdated;

  useEffect(() => {
    if (!eventId) return;

    const socket = getSocket();

    socket.emit("joinEvent", eventId);

    const handleStatus = (payload: EventStatusChangedPayload) => {
      onStatusChangedRef.current?.(payload);
    };
    const handleParticipants = (payload: ParticipantsUpdatedPayload) => {
      onParticipantsUpdatedRef.current?.(payload);
    };

    socket.on("eventStatusChanged", handleStatus);
    socket.on("participantsUpdated", handleParticipants);

    return () => {
      socket.emit("leaveEvent", eventId);
      socket.off("eventStatusChanged", handleStatus);
      socket.off("participantsUpdated", handleParticipants);
    };
  }, [eventId]);
}

// Хук для сповіщень (дзвіночок)

interface UseNotificationsSocketOptions {
  userId: string | undefined;
  onNewNotification?: (payload: NewNotificationPayload) => void;
}

export function useNotificationsSocket({
  userId,
  onNewNotification,
}: UseNotificationsSocketOptions) {
  const onNewNotificationRef = useRef(onNewNotification);
  onNewNotificationRef.current = onNewNotification;

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    socket.emit("joinUser", userId);

    const handleNotification = (payload: NewNotificationPayload) => {
      onNewNotificationRef.current?.({ ...payload, isRead: false });
    };

    socket.on("newNotification", handleNotification);

    return () => {
      socket.off("newNotification", handleNotification);
    };
  }, [userId]);
}

// Хук для списку подій (глобальний лічильник + нові події)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventCreatedPayload = Record<string, any>;

interface UseEventsListSocketOptions {
  onParticipantsUpdated?: (payload: ParticipantsUpdatedPayload) => void;
  onEventCreated?: (payload: EventCreatedPayload) => void;
}

export function useEventsListSocket({
  onParticipantsUpdated,
  onEventCreated,
}: UseEventsListSocketOptions) {
  const onParticipantsUpdatedRef = useRef(onParticipantsUpdated);
  onParticipantsUpdatedRef.current = onParticipantsUpdated;
  const onEventCreatedRef = useRef(onEventCreated);
  onEventCreatedRef.current = onEventCreated;

  useEffect(() => {
    const socket = getSocket();

    // Якщо сокет вже підключений — одразу заходимо в кімнату,
    // інакше чекаємо події connect (щоб emit не загубився)
    if (socket.connected) {
      socket.emit("joinEventsList");
    } else {
      socket.once("connect", () => socket.emit("joinEventsList"));
    }

    const handleParticipants = (payload: ParticipantsUpdatedPayload) => {
      onParticipantsUpdatedRef.current?.(payload);
    };
    const handleEventCreated = (payload: EventCreatedPayload) => {
      onEventCreatedRef.current?.(payload);
    };

    socket.on("participantsUpdatedGlobal", handleParticipants);
    socket.on("eventCreated", handleEventCreated);

    return () => {
      socket.off("participantsUpdatedGlobal", handleParticipants);
      socket.off("eventCreated", handleEventCreated);
    };
  }, []);
}

// Утиліта: відключити сокет при логауті
export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
}
