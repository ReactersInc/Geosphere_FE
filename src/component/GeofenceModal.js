import React, { useState } from 'react';
import { Modal, View, CustomText, FlatList, TouchableOpacity, StyleSheet, TextInput, Switch, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GeofenceModal = ({ isVisible, onClose, geofences, onSelectGeofence }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'radius'
  const [editingGeofence, setEditingGeofence] = useState(null);
  const [filterActive, setFilterActive] = useState(false);

  // Filter geofences based on search query and active status
  const filteredGeofences = geofences.filter(item => {
    const matchesSearch = item.geofence_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterActive) {
      return matchesSearch && item.isActive;
    }
    return matchesSearch;
  });

  // Sort geofences based on selected criteria
  const sortedGeofences = [...filteredGeofences].sort((a, b) => {
    if (sortBy === 'name') {
      return a.geofence_name.localeCompare(b.geofence_name);
    } else if (sortBy === 'date') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'radius') {
      return b.radius - a.radius;
    }
    return 0;
  });

  const handleEditGeofence = (geofence) => {
    setEditingGeofence({...geofence});
    setIsEditing(true);
  };

  const saveEditedGeofence = () => {
    // Here you would typically save the changes to your database
    // For now, we'll just update the local state and close the edit mode
    const updatedGeofences = geofences.map(g => 
      g.geofence_id === editingGeofence.geofence_id ? editingGeofence : g
    );
    // You would typically call a function passed as prop to update the parent state
    // onUpdateGeofences(updatedGeofences);
    
    setIsEditing(false);
    setEditingGeofence(null);
  };

  const toggleGeofenceStatus = (geofence) => {
    const updatedGeofence = {...geofence, isActive: !geofence.isActive};
    // Again, you would typically update the parent state/database
    // For now, we'll just log the change
    console.log(`Toggled status of ${geofence.geofence_name} to ${!geofence.isActive}`);
  };

  const renderGeofence = ({ item }) => (
    <View style={styles.geofenceContainer}>
      <TouchableOpacity
        style={[
          styles.geofenceItem,
          item.isActive ? styles.activeGeofence : styles.inactiveGeofence
        ]}
        onPress={() => onSelectGeofence(item)}
      >
        <View style={styles.geofenceHeader}>
          <CustomText style={styles.geofenceTitle}>{item.geofence_name}</CustomText>
          <View style={styles.geofenceActions}>
            <TouchableOpacity onPress={() => toggleGeofenceStatus(item)} style={styles.iconButton}>
              <Icon name={item.isActive ? "toggle-on" : "toggle-off"} size={24} color={item.isActive ? "#4CAF50" : "#ccc"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditGeofence(item)} style={styles.iconButton}>
              <Icon name="edit" size={20} color="#007BFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {showDetails && (
          <View style={styles.geofenceDetails}>
            <CustomText style={styles.detailText}>Radius: {item.radius}m</CustomText>
            <CustomText style={styles.detailText}>Coordinates: {item.latitude}, {item.longitude}</CustomText>
            {item.description && <CustomText style={styles.detailText}>Description: {item.description}</CustomText>}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEditForm = () => (
    <View style={styles.editForm}>
      <CustomText style={styles.editTitle}>Edit Geofence</CustomText>
      
      <CustomText style={styles.inputLabel}>Name</CustomText>
      <TextInput
        style={styles.input}
        value={editingGeofence?.geofence_name || ''}
        onChangeText={(text) => setEditingGeofence({...editingGeofence, geofence_name: text})}
        placeholder="Geofence Name"
      />
      
      <CustomText style={styles.inputLabel}>Radius (meters)</CustomText>
      <TextInput
        style={styles.input}
        value={String(editingGeofence?.radius || '')}
        onChangeText={(text) => setEditingGeofence({...editingGeofence, radius: parseFloat(text) || 0})}
        keyboardType="numeric"
        placeholder="Radius in meters"
      />
      
      <CustomText style={styles.inputLabel}>Latitude</CustomText>
      <TextInput
        style={styles.input}
        value={String(editingGeofence?.latitude || '')}
        onChangeText={(text) => setEditingGeofence({...editingGeofence, latitude: parseFloat(text) || 0})}
        keyboardType="numeric"
        placeholder="Latitude"
      />
      
      <CustomText style={styles.inputLabel}>Longitude</CustomText>
      <TextInput
        style={styles.input}
        value={String(editingGeofence?.longitude || '')}
        onChangeText={(text) => setEditingGeofence({...editingGeofence, longitude: parseFloat(text) || 0})}
        keyboardType="numeric"
        placeholder="Longitude"
      />
      
      <CustomText style={styles.inputLabel}>Description</CustomText>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={editingGeofence?.description || ''}
        onChangeText={(text) => setEditingGeofence({...editingGeofence, description: text})}
        placeholder="Description"
        multiline={true}
        numberOfLines={3}
      />
      
      <View style={styles.editButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={() => {
            setIsEditing(false);
            setEditingGeofence(null);
          }}
        >
          <CustomText style={styles.buttonText}>Cancel</CustomText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={saveEditedGeofence}
        >
          <CustomText style={styles.buttonText}>Save Changes</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>Geofence Manager</CustomText>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {isEditing ? (
            renderEditForm()
          ) : (
            <>
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search geofences..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.controlsContainer}>
                <View style={styles.controlRow}>
                  <CustomText style={styles.controlLabel}>Show Details</CustomText>
                  <Switch
                    value={showDetails}
                    onValueChange={setShowDetails}
                    trackColor={{ false: "#ccc", true: "#81b0ff" }}
                    thumbColor={showDetails ? "#007BFF" : "#f4f3f4"}
                  />
                </View>
                
                <View style={styles.controlRow}>
                  <CustomText style={styles.controlLabel}>Active Only</CustomText>
                  <Switch
                    value={filterActive}
                    onValueChange={setFilterActive}
                    trackColor={{ false: "#ccc", true: "#81b0ff" }}
                    thumbColor={filterActive ? "#007BFF" : "#f4f3f4"}
                  />
                </View>

                <View style={styles.sortContainer}>
                  <CustomText style={styles.controlLabel}>Sort By:</CustomText>
                  <View style={styles.sortButtons}>
                    <TouchableOpacity
                      style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
                      onPress={() => setSortBy('name')}
                    >
                      <CustomText style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortButtonText]}>Name</CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sortButton, sortBy === 'date' && styles.activeSortButton]}
                      onPress={() => setSortBy('date')}
                    >
                      <CustomText style={[styles.sortButtonText, sortBy === 'date' && styles.activeSortButtonText]}>Date</CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sortButton, sortBy === 'radius' && styles.activeSortButton]}
                      onPress={() => setSortBy('radius')}
                    >
                      <CustomText style={[styles.sortButtonText, sortBy === 'radius' && styles.activeSortButtonText]}>Radius</CustomText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.listContainer}>
                {sortedGeofences.length > 0 ? (
                  <FlatList
                    data={sortedGeofences}
                    renderItem={renderGeofence}
                    keyExtractor={(item) => item.geofence_id}
                    style={styles.list}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Icon name="place" size={50} color="#ccc" />
                    <CustomText style={styles.emptyStateText}>No geofences found</CustomText>
                    <CustomText style={styles.emptyStateSubText}>
                      {searchQuery ? 'Try a different search term' : 'Create your first geofence'}
                    </CustomText>
                  </View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.addButton]}>
                  <Icon name="add" size={20} color="white" />
                  <CustomText style={styles.buttonText}>Add New Geofence</CustomText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  controlsContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  controlLabel: {
    fontSize: 14,
    color: '#555',
  },
  sortContainer: {
    marginTop: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  sortButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
  },
  activeSortButton: {
    backgroundColor: '#007BFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#555',
  },
  activeSortButtonText: {
    color: 'white',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  list: {
    flex: 1,
  },
  geofenceContainer: {
    marginVertical: 5,
  },
  geofenceItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeGeofence: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  inactiveGeofence: {
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
    opacity: 0.7,
  },
  geofenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  geofenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  geofenceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
  geofenceDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  buttonContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  editForm: {
    padding: 15,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 5,
  },
});

export default GeofenceModal;