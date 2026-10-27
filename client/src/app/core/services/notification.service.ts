import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { NotificationItem } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly auth = inject(AuthService);
  private hubConnection: HubConnection | null = null;
  private toastTimer: any = null;

  public readonly notifications = signal<NotificationItem[]>([]);
  public readonly unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);
  public readonly latestToast = signal<NotificationItem | null>(null);
  public readonly isConnected = signal<boolean>(false);

  constructor() {
    effect(() => {
      const token = this.auth.token();
      if (token) {
        this.startConnection();
      } else {
        this.stopConnection();
      }
    });
  }

  public startConnection(): void {
    if (this.hubConnection || !this.auth.token()) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5177/hubs/notifications', {
        accessTokenFactory: () => this.auth.token() ?? ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.hubConnection.on('ReceiveNotification', (payload: any) => {
      const item: NotificationItem = {
        id: payload.id || 'notif-' + Date.now(),
        title: payload.title || 'Notification',
        message: payload.message || '',
        type: payload.type || 'System',
        createdAtUtc: payload.createdAtUtc || new Date().toISOString(),
        isRead: false,
        metadata: payload.metadata
      };

      // Prepend notification
      this.notifications.set([item, ...this.notifications()]);

      // Show toast
      this.showToast(item);

      // Play soft chime sound via Web Audio API
      this.playChime();
    });

    this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
      })
      .catch(() => {
        this.isConnected.set(false);
      });

    this.hubConnection.onclose(() => {
      this.isConnected.set(false);
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
    });
  }

  public getHubConnection(): HubConnection | null {
    return this.hubConnection;
  }

  public joinConversationRoom(conversationId: string): void {
    if (this.hubConnection && this.isConnected()) {
      this.hubConnection.invoke('JoinConversation', conversationId).catch(() => {});
    }
  }

  public leaveConversationRoom(conversationId: string): void {
    if (this.hubConnection && this.isConnected()) {
      this.hubConnection.invoke('LeaveConversation', conversationId).catch(() => {});
    }
  }

  public sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (this.hubConnection && this.isConnected()) {
      this.hubConnection.invoke('SendTypingIndicator', conversationId, isTyping).catch(() => {});
    }
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
      this.isConnected.set(false);
    }
    this.notifications.set([]);
    this.latestToast.set(null);
  }

  public showToast(titleOrItem: string | NotificationItem, message = '', type = 'System'): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    const item: NotificationItem = typeof titleOrItem === 'string'
      ? {
          id: 'toast-' + Date.now(),
          title: titleOrItem,
          message,
          type,
          createdAtUtc: new Date().toISOString(),
          isRead: false
        }
      : titleOrItem;

    this.latestToast.set(item);
    this.toastTimer = setTimeout(() => {
      this.dismissToast();
    }, 6000);
  }

  public dismissToast(): void {
    this.latestToast.set(null);
  }

  public markAsRead(id: string): void {
    this.notifications.set(
      this.notifications().map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  public markAllAsRead(): void {
    this.notifications.set(
      this.notifications().map((n) => ({ ...n, isRead: true }))
    );
  }

  private playChime(): void {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy ignored
    }
  }
}
