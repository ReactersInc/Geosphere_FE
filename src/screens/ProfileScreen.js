import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FeatherIcon from "react-native-vector-icons/Feather";
import * as ImagePicker from "expo-image-picker";
import CustomText from "../component/CustomText";
import { useUser } from "../context/userContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useToast } from "../component/ToastProvider";
import { useConfirmation } from "../component/ConfirmationProvider";
import { useProfile } from "../context/ProfileContext";

// Get device dimensions
const { height, width } = Dimensions.get("window");

// Privacy settings options
const PRIVACY_OPTIONS = [
  {
    id: "privacy-mode",
    title: "Privacy Mode",
    description:
      "When enabled, your exact location will be hidden from all trackers",
    icon: "incognito",
    value: false,
  },
  {
    id: "share-location",
    title: "Share My Location",
    description: "Allow approved people to view your location",
    icon: "map-marker",
    value: true,
  },
  {
    id: "location-history",
    title: "Save Location History",
    description: "Store your location data for personal review",
    icon: "history",
    value: true,
  },
  {
    id: "notifications",
    title: "Push Notifications",
    description: "Receive alerts when someone views your location",
    icon: "bell",
    value: true,
  },
];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [trackers, setTrackers] = useState([]);
  const [privacySettings, setPrivacySettings] = useState(PRIVACY_OPTIONS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const tabBarHeight = useBottomTabBarHeight();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePic: "",
    address: "",
    emergencyContact: "",
  });

  const {
    profile,
    profileLoading,
    profileError,
    fetchProfile,
    refreshProfile,
    clearProfile,
  } = useProfile();

  const { logout } = useUser();
  const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();

  // Fetch profile data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        profilePic: profile.photoUrl || "",
        address: profile.address || "",
        emergencyContact: profile.emergencyContact || "",
      });

      // TODO: When you have tracker data in profile, update trackers here
      // For now, we'll use an empty array until you have tracker data
      // Example: setTrackers(profile.trackers || []);
      setTrackers(profile?.userGeofenceDetails?.inWitchGeofence || []);
    }
  }, [profile]);

  // Toggle switch for privacy settings
  const toggleSetting = (id) => {
    setPrivacySettings(
      privacySettings.map((setting) =>
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
    );


    

    // If privacy mode is toggled, show alert
    if (id === "privacy-mode") {
      const newValue = !privacySettings.find((s) => s.id === id).value;
      if (newValue) {
        showToast({
          message:
            "Privacy mode enabled. Your location will be hidden from all trackers.",
          type: "info",
          duration: 3000,
          position: "top",
        });
      }
    }
  };



  // Handle logout action
  const handleLogout = () => {
    showConfirmation({
      message: "Are you sure you want to Logout?",
      type: "error",
      buttons: [
        {
          text: "No",
          onPress: () => console.log("Cancelled"),
        },
        {
          text: "Yes",
          onPress: () => {
            console.log("Confirmed");
            logout();
          },
        },
      ],
    });
  };

  // Remove a tracker
  const removeTracker = (trackerId) => {
    showConfirmation({
      message: "Are you sure you want to remove this tracker?",
      type: "info",
      buttons: [
        {
          text: "No",
          onPress: () => console.log("Cancelled"),
        },
        {
          text: "Yes",
          onPress: () => {
            console.log("Confirmed");
            setTrackers(trackers.filter((tracker) => tracker.id !== trackerId));
            // TODO: Add API call to remove tracker
            // removeTrackerAPI(trackerId);
          },
        },
      ],
    });
  };

  // Open permission modal for a tracker
  const openPermissionModal = (tracker) => {
    setSelectedTracker(tracker);
    setShowPermissionModal(true);
  };

  // Handle image picker for profile photo
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({
          ...formData,
          profilePic: result.assets[0].uri,
        });
      }
    } catch (error) {
      showToast({
        message: "Error picking image",
        type: "error",
        duration: 3000,
        position: "bottom",
      });
    }
  };

  // Save profile changes
  const saveChanges = () => {
    // TODO: Add API call to update profile
    // updateProfileAPI(formData);

    setIsEditMode(false);
    showToast({
      message: "Profile updated successfully",
      type: "success",
      duration: 3000,
      position: "bottom",
    });
  };

  // Header component with profile picture and basic info
  const ProfileHeader = () => {
    if (profileLoading) {
      return (
        <View style={styles.loadingContainer}>
          <CustomText style={styles.loadingText}>Loading profile...</CustomText>
        </View>
      );
    }

    if (!profile) {
      return (
        <View style={styles.loadingContainer}>
          <CustomText style={styles.loadingText}>
            No profile data available
          </CustomText>
        </View>
      );
    }

    return isEditMode ? (
      <View style={styles.headerEdit}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={pickImage}
        >
          <Image
            source={{
              uri: formData.profilePic || "https://via.placeholder.com/100",
            }}
            style={styles.profileImage}
          />
          <View style={styles.editImageButton}>
            <Icon name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <CustomText style={styles.inputLabel}>First Name</CustomText>
            <TextInput
              style={styles.textInput}
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              placeholder="First Name"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputHalf}>
            <CustomText style={styles.inputLabel}>Last Name</CustomText>
            <TextInput
              style={styles.textInput}
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              placeholder="Last Name"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <CustomText style={styles.inputLabel}>Email</CustomText>
          <TextInput
            style={styles.textInput}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomText style={styles.inputLabel}>Phone</CustomText>
          <TextInput
            style={styles.textInput}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomText style={styles.inputLabel}>Address</CustomText>
          <TextInput
            style={styles.textInput}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomText style={styles.inputLabel}>Emergency Contact</CustomText>
          <TextInput
            style={styles.textInput}
            value={formData.emergencyContact}
            onChangeText={(text) =>
              setFormData({ ...formData, emergencyContact: text })
            }
            placeholder="Emergency Contact"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                email: profile.email || "",
                phone: profile.phone || "",
                profilePic: profile.photoUrl || "",
                address: profile.address || "",
                emergencyContact: profile.emergencyContact || "",
              });
              setIsEditMode(false);
            }}
          >
            <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={saveChanges}
          >
            <CustomText style={styles.saveButtonText}>Save Changes</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      <View style={styles.header}>
        <LinearGradient
          colors={["#6C63FF", "#5046e5"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: profile.photoUrl || "https://via.placeholder.com/100",
                }}
                style={styles.profileImage}
              />
            </View>
            <CustomText style={styles.userName}>
              {`${profile.firstName || ""} ${profile.lastName || ""}`.trim()}
            </CustomText>
            <CustomText style={styles.userEmail}>
              {profile.email || ""}
            </CustomText>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditMode(true)}
            >
              <Icon name="pencil" size={16} color="#fff" />
              <CustomText style={styles.editButtonText}>
                Edit Profile
              </CustomText>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Icon
              name="phone"
              size={20}
              color="#6C63FF"
              style={styles.infoIcon}
            />
            <View>
              <CustomText style={styles.infoLabel}>Phone</CustomText>
              <CustomText style={styles.infoValue}>
                {profile.phone || "Not provided"}
              </CustomText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon
              name="map-marker"
              size={20}
              color="#6C63FF"
              style={styles.infoIcon}
            />
            <View>
              <CustomText style={styles.infoLabel}>Address</CustomText>
              <CustomText style={styles.infoValue} numberOfLines={1}>
                {profile.address || "Not provided"}
              </CustomText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon
              name="alert-circle"
              size={20}
              color="#6C63FF"
              style={styles.infoIcon}
            />
            <View>
              <CustomText style={styles.infoLabel}>
                Emergency Contact
              </CustomText>
              <CustomText style={styles.infoValue} numberOfLines={1}>
                {profile.emergencyContact || "Not provided"}
              </CustomText>
            </View>
          </View>

          {/* Account Status Card */}
          <View style={styles.infoCard}>
            <Icon
              name={profile.isVerified ? "check-circle" : "alert-circle"}
              size={20}
              color={profile.isVerified ? "#4CAF50" : "#FF9800"}
              style={styles.infoIcon}
            />
            <View>
              <CustomText style={styles.infoLabel}>Account Status</CustomText>
              <CustomText
                style={[
                  styles.infoValue,
                  { color: profile.isVerified ? "#4CAF50" : "#FF9800" },
                ]}
              >
                {profile.isVerified ? "Verified" : "Not Verified"}
              </CustomText>
            </View>
          </View>

          {/* Profile Visibility Card */}
          <View style={styles.infoCard}>
            <Icon
              name={profile.publicProfile ? "eye" : "eye-off"}
              size={20}
              color="#6C63FF"
              style={styles.infoIcon}
            />
            <View>
              <CustomText style={styles.infoLabel}>
                Profile Visibility
              </CustomText>
              <CustomText style={styles.infoValue}>
                {profile.publicProfile ? "Public" : "Private"}
              </CustomText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Tracker Card component
  const TrackerCard = ({ tracker }) => {

    const charCode = tracker.name.charCodeAt(0);
    const hue = (charCode * 15) % 360;
    const personColor = `hsl(${hue}, 70%, 60%)`;

    return (
      <TouchableOpacity
        style={styles.trackerCard}
        onPress={() =>
          navigation.navigate("TrackedGeofenceScreen", {
            geofenceId: tracker?.geofenceId,
          })
        }
      >
        <View style={styles.trackerHeader}>
          <View style={styles.trackerIdentity}>
            <View
              style={[styles.trackerAvatar, { backgroundColor: personColor }]}
            >
              <CustomText style={styles.trackerInitial}>
                {tracker.name.charAt(0).toUpperCase()}
              </CustomText>
            </View>
            <View>
              <CustomText style={styles.trackerName}>{tracker.name}</CustomText>
              <View style={styles.trackerMeta}>
                <CustomText style={styles.trackerRelationship}>
                  {tracker.relationship}
                </CustomText>
                <View style={styles.trackerSinceBadge}>
                  <Icon name="clock-outline" size={10} color="#666" />
                  <CustomText style={styles.trackerSince}>
                    Since {new Date(tracker.since).toLocaleDateString()}
                  </CustomText>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.trackerMenuButton}
            onPress={() => openPermissionModal(tracker)}
          >
            <Icon name="dots-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.permissionList}>
          {tracker.activePermissions?.includes("location") && (
            <View style={styles.permissionTag}>
              <Icon name="map-marker" size={12} color="#6C63FF" />
              <CustomText style={styles.permissionText}>Location</CustomText>
            </View>
          )}
          {tracker.activePermissions?.includes("notifications") && (
            <View style={styles.permissionTag}>
              <Icon name="bell" size={12} color="#6C63FF" />
              <CustomText style={styles.permissionText}>
                Notifications
              </CustomText>
            </View>
          )}
          {tracker.activePermissions?.includes("history") && (
            <View style={styles.permissionTag}>
              <Icon name="history" size={12} color="#6C63FF" />
              <CustomText style={styles.permissionText}>History</CustomText>
            </View>
          )}
        </View>

        <View style={styles.trackerActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeTracker(tracker.id)}
          >
            <Icon name="close-circle-outline" size={16} color="#FF4785" />
            <CustomText style={styles.removeButtonText}>Remove</CustomText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Permission Modal Component
  const PermissionModal = () => {
    if (!selectedTracker) return null;

    const [localPermissions, setLocalPermissions] = useState([
      ...selectedTracker.activePermissions,
    ]);

    const togglePermission = (permission) => {
      if (localPermissions?.includes(permission)) {
        setLocalPermissions(localPermissions.filter((p) => p !== permission));
      } else {
        setLocalPermissions([...localPermissions, permission]);
      }
    };

    const savePermissions = () => {
      setTrackers(
        trackers.map((t) =>
          t.id === selectedTracker.id
            ? { ...t, activePermissions: localPermissions }
            : t
        )
      );
      setShowPermissionModal(false);
      // TODO: Add API call to update permissions
      // updateTrackerPermissions(selectedTracker.id, localPermissions);
    };

    return (
      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>
                Manage Permissions
              </CustomText>
              <TouchableOpacity onPress={() => setShowPermissionModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <CustomText style={styles.modalSubtitle}>
                Permissions for {selectedTracker.name}
              </CustomText>

              <View style={styles.permissionOption}>
                <View style={styles.permissionDetails}>
                  <Icon name="map-marker" size={20} color="#6C63FF" />
                  <View style={styles.permissionInfo}>
                    <CustomText style={styles.permissionTitle}>
                      Location Tracking
                    </CustomText>
                    <CustomText style={styles.permissionDescription}>
                      Allow this person to see your location
                    </CustomText>
                  </View>
                </View>
                <Switch
                  value={localPermissions?.includes("location")}
                  onValueChange={() => togglePermission("location")}
                  trackColor={{ false: "#e0e0e0", true: "#d4d2ff" }}
                  thumbColor={
                    localPermissions?.includes("location")
                      ? "#6C63FF"
                      : "#f4f3f4"
                  }
                />
              </View>

              <View style={styles.permissionOption}>
                <View style={styles.permissionDetails}>
                  <Icon name="bell" size={20} color="#6C63FF" />
                  <View style={styles.permissionInfo}>
                    <CustomText style={styles.permissionTitle}>
                      Notifications
                    </CustomText>
                    <CustomText style={styles.permissionDescription}>
                      Send notifications about your location
                    </CustomText>
                  </View>
                </View>
                <Switch
                  value={localPermissions?.includes("notifications")}
                  onValueChange={() => togglePermission("notifications")}
                  trackColor={{ false: "#e0e0e0", true: "#d4d2ff" }}
                  thumbColor={
                    localPermissions?.includes("notifications")
                      ? "#6C63FF"
                      : "#f4f3f4"
                  }
                />
              </View>

              <View style={styles.permissionOption}>
                <View style={styles.permissionDetails}>
                  <Icon name="history" size={20} color="#6C63FF" />
                  <View style={styles.permissionInfo}>
                    <CustomText style={styles.permissionTitle}>
                      Location History
                    </CustomText>
                    <CustomText style={styles.permissionDescription}>
                      Access to your location history
                    </CustomText>
                  </View>
                </View>
                <Switch
                  value={localPermissions?.includes("history")}
                  onValueChange={() => togglePermission("history")}
                  trackColor={{ false: "#e0e0e0", true: "#d4d2ff" }}
                  thumbColor={
                    localPermissions?.includes("history")
                      ? "#6C63FF"
                      : "#f4f3f4"
                  }
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowPermissionModal(false)}
              >
                <CustomText style={styles.cancelModalText}>Cancel</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveModalButton}
                onPress={savePermissions}
              >
                <CustomText style={styles.saveModalText}>
                  Save Changes
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: tabBarHeight }]}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <CustomText style={styles.screenTitle}>Profile</CustomText>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Icon name="cog" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileHeader />

          {!isEditMode && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <CustomText style={styles.sectionTitle}>
                    Zones Tracking You
                  </CustomText>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Geozone", {
                        geofence: trackers.map((tracker) => ({
                          id: tracker.id,
                          name: tracker.name,
                          description: tracker.description,
                        })),
                      })
                    }
                  >
                    <CustomText style={styles.seeAll}>Manage</CustomText>
                  </TouchableOpacity>
                </View>
                <View style={styles.sectionContent}>
                  {trackers.length > 0 ? (
                    trackers.map((tracker) => (
                      <TrackerCard key={tracker.id} tracker={tracker} />
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Icon
                        name="account-multiple-outline"
                        size={40}
                        color="#ccc"
                      />
                      <CustomText style={styles.emptyStateText}>
                        No one is tracking you yet
                      </CustomText>
                      <CustomText style={styles.emptyStateSubtext}>
                        Share your location with family and friends to get
                        started
                      </CustomText>
                    </View>
                  )}
                </View>
              </View>

              {/* Geofence Summary Section */}
              {profile?.userGeofenceDetails && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <CustomText style={styles.sectionTitle}>
                      Zones Tracking You
                    </CustomText>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Geofences")}
                    >
                      <CustomText style={styles.seeAll}>View All</CustomText>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.sectionContent}>
                    <View style={styles.summaryCard}>
                      <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                          <CustomText style={styles.summaryNumber}>
                            {profile.userGeofenceDetails.totalGeofence}
                          </CustomText>
                          <CustomText style={styles.summaryLabel}>
                            Total Geofences
                          </CustomText>
                        </View>
                        <View style={styles.summaryItem}>
                          <CustomText style={styles.summaryNumber}>
                            {profile.userGeofenceDetails.totalGeofenceInUse}
                          </CustomText>
                          <CustomText style={styles.summaryLabel}>
                            Active
                          </CustomText>
                        </View>
                      </View>
                      <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                          <CustomText style={styles.summaryNumber}>
                            {profile.userGeofenceDetails.totalUsersInGeofence}
                          </CustomText>
                          <CustomText style={styles.summaryLabel}>
                            Users in Geofence
                          </CustomText>
                        </View>
                        <View style={styles.summaryItem}>
                          <CustomText style={styles.summaryNumber}>
                            {profile.userGeofenceDetails.totalConnections}
                          </CustomText>
                          <CustomText style={styles.summaryLabel}>
                            Connections
                          </CustomText>
                        </View>
                      </View>

                      {/* Pending Requests */}
                      {(profile.userGeofenceDetails.pendingGeofenceRequests >
                        0 ||
                        profile.userGeofenceDetails.pendingConnectionRequests >
                          0) && (
                        <View style={styles.pendingSection}>
                          <CustomText style={styles.pendingTitle}>
                            Pending Requests
                          </CustomText>
                          <View style={styles.pendingRow}>
                            <View style={styles.pendingItem}>
                              <Icon
                                name="map-marker-plus"
                                size={16}
                                color="#FF9800"
                              />
                              <CustomText style={styles.pendingText}>
                                {
                                  profile.userGeofenceDetails
                                    .pendingGeofenceRequests
                                }{" "}
                                Geofence
                              </CustomText>
                            </View>
                            <View style={styles.pendingItem}>
                              <Icon
                                name="account-plus"
                                size={16}
                                color="#FF9800"
                              />
                              <CustomText style={styles.pendingText}>
                                {
                                  profile.userGeofenceDetails
                                    .pendingConnectionRequests
                                }{" "}
                                Connection
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <CustomText style={styles.sectionTitle}>
                    Privacy Settings
                  </CustomText>
                </View>
                <View style={styles.sectionContent}>
                  {privacySettings.map((setting) => (
                    <View key={setting.id} style={styles.settingItem}>
                      <View style={styles.settingInfo}>
                        <View style={styles.settingIconContainer}>
                          <Icon name={setting.icon} size={20} color="#6C63FF" />
                        </View>
                        <View style={styles.settingText}>
                          <CustomText style={styles.settingTitle}>
                            {setting.title}
                          </CustomText>
                          <CustomText style={styles.settingDescription}>
                            {setting.description}
                          </CustomText>
                        </View>
                      </View>
                      <Switch
                        value={setting.value}
                        onValueChange={() => toggleSetting(setting.id)}
                        trackColor={{ false: "#e0e0e0", true: "#d4d2ff" }}
                        thumbColor={setting.value ? "#6C63FF" : "#f4f3f4"}
                      />
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Icon name="logout" size={20} color="#FF4785" />
                  <CustomText style={styles.logoutText}>Log Out</CustomText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <PermissionModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  screenTitle: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Manrope-Bold",
  },
  settingsButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Manrope-Medium",
  },
  header: {
    marginBottom: 24,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Manrope-Bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Manrope-Medium",
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    fontFamily: "Manrope-SemiBold",
    marginLeft: 6,
  },
  infoCards: {
    marginTop: -40,
    marginHorizontal: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Manrope-Medium",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Manrope-SemiBold",
    maxWidth: width - 100,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Manrope-Bold",
  },
  seeAll: {
    fontSize: 14,
    color: "#6C63FF",
    fontFamily: "Manrope-SemiBold",
  },
  sectionContent: {
    borderRadius: 12,
  },
  trackerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  trackerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trackerIdentity: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  trackerInitial: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Manrope-Bold",
  },
  trackerName: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Manrope-Bold",
  },
  trackerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  trackerRelationship: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Manrope-Medium",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  trackerSinceBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackerSince: {
    fontSize: 10,
    color: "#666",
    fontFamily: "Manrope-Regular",
    marginLeft: 4,
  },
  trackerMenuButton: {
    padding: 4,
  },
  permissionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  permissionTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 10,
    color: "#6C63FF",
    fontFamily: "Manrope-Medium",
    marginLeft: 4,
  },
  trackerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF4785",
  },
  removeButtonText: {
    fontSize: 12,
    color: "#FF4785",
    fontFamily: "Manrope-SemiBold",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    fontFamily: "Manrope-Medium",
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Manrope-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    color: "#6C63FF",
    fontFamily: "Manrope-Bold",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Manrope-Medium",
    textAlign: "center",
  },
  pendingSection: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginTop: 8,
  },
  pendingTitle: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Manrope-SemiBold",
    marginBottom: 8,
  },
  pendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 0.48,
  },
  pendingText: {
    fontSize: 12,
    color: "#FF9800",
    fontFamily: "Manrope-Medium",
    marginLeft: 6,
  },
  geofenceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  geofenceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  geofenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  geofenceInfo: {
    flex: 1,
  },
  geofenceName: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Manrope-SemiBold",
    marginBottom: 2,
  },
  geofenceDescription: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Manrope-Regular",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Manrope-SemiBold",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Manrope-Regular",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4785",
    fontFamily: "Manrope-SemiBold",
    marginLeft: 8,
  },
  headerEdit: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6C63FF",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  inputHalf: {
    width: "48%",
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Manrope-Medium",
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    fontFamily: "Manrope-Regular",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    width: "48%",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontFamily: "Manrope-SemiBold",
  },
  saveButton: {
    backgroundColor: "#6C63FF",
  },
  saveButtonText: {
    color: "#fff",
    fontFamily: "Manrope-SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width - 40,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Manrope-Bold",
  },
  modalBody: {
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Manrope-Medium",
    marginBottom: 16,
  },
  permissionOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  permissionDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  permissionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Manrope-SemiBold",
  },
  permissionDescription: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Manrope-Regular",
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelModalButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: "48%",
  },
  cancelModalText: {
    color: "#666",
    fontFamily: "Manrope-SemiBold",
  },
  saveModalButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: "48%",
  },
  saveModalText: {
    color: "#fff",
    fontFamily: "Manrope-SemiBold",
  },
});

export default ProfileScreen;
