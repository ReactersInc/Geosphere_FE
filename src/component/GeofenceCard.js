import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from './CustomText';

const { width } = Dimensions.get('window');

const GeofenceCard = ({
  geofence,
  variant = 'default', // 'default' | 'compact' | 'add'
  onPress,
  onToggleActive,
  onToggleNotifications,
  onEdit,
  showActions = false,
  showStatus = true,
  showMeta = true,
  showFooter = true,
  style,
}) => {
  if (variant === 'add') {
    return (
      <TouchableOpacity
        style={[styles.addGeofenceCard, style]}
        onPress={onPress}>
        <LinearGradient
          colors={['#e0e0e0', '#f5f5f5']}
          style={styles.gradientAddCard}>
          <Icon name="plus-circle" size={40} color="#6C63FF" />
          <CustomText style={styles.addGeofenceText}>Add New Geofence</CustomText>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const isCompact = variant === 'compact';
  const gradientColors = geofence.color || ['#6C63FF', '#8E85FF'];

  return (
    <TouchableOpacity
      style={[
        styles.geofenceCard,
        isCompact ? styles.compactCard : styles.defaultCard,
        style,
      ]}
      onPress={onPress}>
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.gradientCard,
          isCompact ? styles.compactGradient : styles.defaultGradient,
        ]}>
        {!isCompact && <LinearGradient colors={gradientColors} style={styles.gradientBar} />}

        <View style={[
          styles.cardContent,
          isCompact && styles.compactContent,
        ]}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <CustomText
                style={[
                  styles.geofenceName,
                  isCompact && styles.compactGeofenceName,
                ]}
                numberOfLines={1}>
                {geofence.geofence_name}
              </CustomText>
              
              {showStatus && (
                <View style={styles.badgeContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: geofence.active ? '#E3F2FD' : '#FFEBEE' },
                    isCompact && styles.compactStatusBadge,
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: geofence.active ? '#2196F3' : '#F44336' },
                    ]} />
                    <CustomText style={[
                      styles.statusText,
                      { color: geofence.active ? '#0D47A1' : '#B71C1C' },
                      isCompact && styles.compactStatusText,
                    ]}>
                      {geofence.active ? 'Active' : 'Inactive'}
                    </CustomText>
                  </View>
                  {geofence.alerts_count > 0 && (
                    <View style={[
                      styles.alertsBadge,
                      isCompact && styles.compactAlertsBadge,
                    ]}>
                      <Icon name="bell-ring" size={12} color="#FFF" />
                      <CustomText style={styles.alertsText}>{geofence.alerts_count}</CustomText>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            {!isCompact && geofence.description && (
              <CustomText style={styles.description} numberOfLines={1}>
                {geofence.description}
              </CustomText>
            )}
          </View>
          
          {showMeta && (
            <View style={[
              styles.metaDataContainer,
              isCompact && styles.compactMetaContainer,
            ]}>
              {!isCompact && (
                <View style={styles.metaData}>
                  <Icon name="map-marker" size={14} color={isCompact ? '#fff' : '#666'} />
                  <CustomText style={[
                    styles.metaText,
                    isCompact && styles.compactMetaText,
                  ]}>
                    {`${geofence.lat.toFixed(4)}, ${geofence.lng.toFixed(4)}`}
                  </CustomText>
                </View>
              )}
              <View style={styles.metaData}>
                <Icon name="radius" size={14} color={isCompact ? '#fff' : '#666'} />
                <CustomText style={[
                  styles.metaText,
                  isCompact && styles.compactMetaText,
                ]}>
                  {geofence.radius}m radius
                </CustomText>
              </View>
              {!isCompact && (
                <View style={styles.metaData}>
                  <Icon name="calendar" size={14} color={isCompact ? '#fff' : '#666'} />
                  <CustomText style={[
                    styles.metaText,
                    isCompact && styles.compactMetaText,
                  ]}>
                    {new Date(geofence.created_at).toLocaleDateString()}
                  </CustomText>
                </View>
              )}
            </View>
          )}
          
          {showFooter && (
            <View style={[
              styles.cardFooter,
              isCompact && styles.compactFooter,
            ]}>
              {showActions ? (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => onToggleActive(geofence.id)}>
                    <Icon 
                      name={geofence.active ? "toggle-switch" : "toggle-switch-off"} 
                      size={24} 
                      color={geofence.active ? "#6C63FF" : "#9e9e9e"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => onToggleNotifications(geofence.id)}>
                    <Icon 
                      name={geofence.notifications ? "bell" : "bell-off"} 
                      size={22} 
                      color={geofence.notifications ? "#6C63FF" : "#9e9e9e"} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => onEdit(geofence)}>
                    <Icon name="pencil" size={22} color="#6C63FF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyActions} />
              )}
              
              <TouchableOpacity 
                style={[
                  styles.viewButton,
                  isCompact && styles.compactViewButton,
                ]}
                onPress={onPress}>
                <CustomText style={[
                  styles.viewButtonText,
                  isCompact && styles.compactViewButtonText,
                ]}>
                  {isCompact ? 'View' : 'View Details'}
                </CustomText>
                <Icon 
                  name="chevron-right" 
                  size={16} 
                  color={isCompact ? "#fff" : "#6C63FF"} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  geofenceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  defaultCard: {
    width: width * 0.9,
    marginBottom: 16,
  },
  compactCard: {
    width: width * 0.7,
    height: 150,
    marginRight: 12,
  },
  gradientCard: {
    flexDirection: 'row',
  },
  defaultGradient: {
    backgroundColor: '#fff',
  },
  compactGradient: {
    padding: 16,
    height: '100%',
    justifyContent: 'space-between',
  },
  gradientBar: {
    width: 8,
  },
  gradientAddCard: {
    padding: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  compactContent: {
    padding: 0,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  geofenceName: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
    flex: 1,
  },
  compactGeofenceName: {
    color: '#fff',
    fontSize: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  compactStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
  },
  compactStatusText: {
    color: '#fff',
  },
  alertsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4785',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  compactAlertsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  alertsText: {
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
    color: '#fff',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  metaDataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  compactMetaContainer: {
    marginBottom: 8,
    marginTop: 8,
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Medium',
    marginLeft: 4,
  },
  compactMetaText: {
    color: '#fff',
    opacity: 0.9,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  compactFooter: {
    marginTop: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyActions: {
    flex: 1,
  },
  iconButton: {
    marginRight: 16,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  compactViewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    fontFamily: 'Manrope-SemiBold',
    marginRight: 4,
  },
  compactViewButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  addGeofenceCard: {
    width: width * 0.35,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addGeofenceText: {
    marginTop: 8,
    color: '#6C63FF',
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
    textAlign: 'center',
  },
});

export default GeofenceCard;