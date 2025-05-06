// services/BackgroundLocationTask.js
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { UseApi } from '../hooks/UseApi';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const { latitude, longitude, speed, heading, accuracy } = locations[0].coords;
    const { post } = UseApi();

    try {
      console.log("background location task data runing...", locations[0].coords);
      const response = await post('/geofence/locations/update', {
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        deviceInfo: {
          platform: Platform.OS,
          model: Platform.OS === 'ios' ? 'iPhone' : 'Android',
        },
      });

      console.log('Background location update sent:', response.data);
    } catch (err) {
      console.error('Failed to send background location update:', err);
    }
  }
});

export { LOCATION_TASK_NAME };
