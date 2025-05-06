// services/WebSocketService.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
  }

  connect = (token, userId) => {

    console.log("the token and the user id are in ws service : ", token, userId);
    const socket = new SockJS('http://192.168.1.41:8080/ws');
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP: ', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected: ', frame);
      
      // Subscribe to user location updates
      this.subscribeToUserLocation(userId);
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  };

  subscribeToUserLocation = (userId) => {
    this.subscriptions[`user_${userId}_location`] = this.client.subscribe(
      `/topic/user/${userId}/location`,
      (message) => {
        const locationUpdate = JSON.parse(message.body);
        // Handle location update (e.g., update state, show notification, etc.)
        console.log('Location update:', locationUpdate);
      }
    );
  };

  subscribeToGeofenceEvents = (userId, callback) => {
    this.subscriptions[`user_${userId}_geofence`] = this.client.subscribe(
      `/topic/user/${userId}/geofence`,
      (message) => {
        callback(message);
      }
    );
  }

  disconnect = () => {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  };
}

export default new WebSocketService();