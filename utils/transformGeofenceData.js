// utils/transformGeofenceData.js
export const transformGeofenceData = (apiData) => {
    return apiData.map(geofence => {
      // Calculate center point from coordinates (simplified)
      let centerLat = 0;
      let centerLng = 0;
      if (geofence.coordinates && geofence.coordinates.length > 0) {
        centerLat = geofence.coordinates.reduce((sum, coord) => sum + coord.lat, 0) / geofence.coordinates.length;
        centerLng = geofence.coordinates.reduce((sum, coord) => sum + coord.lang, 0) / geofence.coordinates.length;
      }
  
      // Calculate approximate radius (simplified - this would need a proper calculation)
      let radius = 100; // default
      if (geofence.coordinates && geofence.coordinates.length > 1) {
        const firstCoord = geofence.coordinates[0];
        const secondCoord = geofence.coordinates[1];
        radius = Math.sqrt(
          Math.pow(firstCoord.lat - secondCoord.lat, 2) + 
          Math.pow(firstCoord.lang - secondCoord.lang, 2)
        ) * 100000; // rough approximation in meters
      }
  
      // Parse colors or use default
      let colors = ['#6C63FF', '#5046e5']; // default
      try {
        if (geofence.colors && geofence.colors !== 'null') {
          colors = JSON.parse(geofence.colors);
        }
      } catch (e) {
        console.error('Error parsing colors', e);
      }
  
      return {
        id: geofence.id.toString(),
        geofence_name: geofence.name,
        radius: Math.round(radius),
        lat: centerLat,
        lng: centerLng,
        created_at: new Date().toISOString(), // API doesn't provide this, using current date
        active: geofence.status === 1,
        notifications: geofence.enableNotifications,
        color: colors,
        description: geofence.description,
        alerts_count: geofence.alertCount || 0,
        coordinates: geofence.coordinates // Keep original coordinates for map view
      };
    });
  };