// services/WebSocketService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  static client = null;
  static isConnected = false;
  static onConnectedCallback = null;
  static subscriptions = new Map();

  constructor() {
    this.socket = null;
  }

  static isConnectedFlag() {
  return this.isConnected;
}

  static connect(token, userId) {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      // Create SockJS connection
      const socket = new SockJS('http://192.168.164.74:8080/ws');
      
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: (frame) => {
          console.log('Connected to WebSocket:', frame);
          this.isConnected = true;
          
          if (this.onConnectedCallback) {
            this.onConnectedCallback();
          }
        },
        onDisconnect: () => {
          console.log('Disconnected from WebSocket');
          this.isConnected = false;
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
        },
      });

      this.client.activate();
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  static disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  static setOnConnectedCallback(callback) {
    this.onConnectedCallback = callback;
  }

  static subscribeToUserLocation(userId, callback) {
    if (!this.isConnected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    const destination = `/topic/user/${userId}/location`;
    
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        console.log(`📡 Incoming message from ${destination}:`, message.body);
        const locationData = JSON.parse(message.body);
        console.log("📍 Parsed locationData:", locationData);
        callback(locationData);
      } catch (error) {
        console.error('Error parsing location message:', error);
      }
    });

    this.subscriptions.set(`user-location-${userId}`, subscription);
    console.log(`Subscribed to user location: ${destination}`);
  }

  static subscribeToGeofenceUpdates(geofenceId, callback) {
    if (!this.isConnected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    const destination = `/topic/geofence/${geofenceId}`;
    
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const updateData = JSON.parse(message.body);
        callback(updateData);
      } catch (error) {
        console.error('Error parsing geofence message:', error);
      }
    });

    this.subscriptions.set(`geofence-${geofenceId}`, subscription);
    console.log(`Subscribed to geofence updates: ${destination}`);
  }

  static unsubscribe(subscriptionKey) {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      console.log(`Unsubscribed from: ${subscriptionKey}`);
    }
  }

  static isConnected() {
    return this.isConnected;
  }
}

export default WebSocketService;
