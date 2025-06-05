import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "../component/CustomText";
import { UseApi } from "../hooks/UseApi";
import { BlurView } from "expo-blur";
import { useToast } from "../component/ToastProvider";
import { useConfirmation } from "../component/ConfirmationProvider";

const AddEntityToGeofenceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { geofenceId, geofenceName } = route.params;
  const { post } = UseApi();
  const {showToast} = useToast();
  const {showConfirmation} = useConfirmation();
  
  const [activeTab, setActiveTab] = useState("people"); // "people" or "devices"
  const [email, setEmail] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [suggestedEmails, setSuggestedEmails] = useState([]);
  
  // Mock data for suggested emails - in a real app, fetch from API
  useEffect(() => {
    // Simulating API call to get suggested contacts
    setSuggestedEmails([
      { email: "john.doe@example.com", name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
      { email: "sarah.smith@example.com", name: "Sarah Smith", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
      { email: "mike.johnson@example.com", name: "Mike Johnson", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
    ]);
  }, []);

  const handleAddPerson = async () => {
    if (!email.trim()) {
      showToast({
        type: "error",
        message: "Please enter a valid email address",
        position: "top",
        icon: "alert-circle"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await post("/geofence/add-people", {
        email: email.trim(),
        geofenceId: geofenceId
      });

      console.log("Response from adding person:", response);
      
      if (response.result?.responseCode === 200 || response.result?.responseCode === 201) {
        // Add to recently added list
        setRecentlyAdded(prev => [
          { 
            id: Date.now().toString(),
            email: email,
            type: "person",
            addedAt: new Date()
          },
          ...prev
        ]);
        
        setEmail("");
        showToast({
          type: "success",
          message: "Person added to geofence successfully",
          position: "top",
          icon: "checkmark-circle"
        });
        
      }if(response?.result?.responseCode == 100037){
        showToast({
          type: "error",
          message: "This person is already added to the geofence",
          position: "top",
          icon: "alert-circle"
        });
      }if(response?.result?.responseCode != 200 && response?.result?.responseCode != 201 && response?.result?.responseCode != 100037){ 
        showToast({
          type: "error",
          message: "Failed to add person to geofence",
          position: "top",
          icon: "alert-circle"
        });
      }

    } catch (error) {
      console.error("Error adding person to geofence:", error);
      showToast({
        type: "error",
        message: "An error occurred while adding person to geofence",
        position: "top",
        icon: "alert-circle"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddDevice = async () => {
    if (!deviceId.trim()) {
      showToast({
        type: "error",
        message: "Please enter a valid device ID",
        position: "top",
        icon: "alert-circle"
      });

      return;
    }
    
    // This is a placeholder for future implementation
   showToast({

      type: "info",
      message: "Device addition is not implemented yet",
      position: "top",
      icon: "information"
    });
    
    // The actual implementation would be similar to handleAddPerson
    // but with the appropriate endpoint and payload
  };
  
  const selectSuggestedEmail = (email) => {
    setEmail(email);
  };
  
  const formatTimeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return "Just now";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#263238" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <CustomText style={styles.titleText}>
              Add to {geofenceName || "Geofence"}
            </CustomText>
          </View>
          <View style={styles.placeholderButton} />
        </View>
        
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "people" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("people")}
          >
            <Icon 
              name="account-multiple" 
              size={22} 
              color={activeTab === "people" ? "#6C63FF" : "#90A4AE"} 
            />
            <CustomText 
              style={[
                styles.tabText,
                activeTab === "people" && styles.activeTabText,
              ]}
            >
              People
            </CustomText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "devices" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("devices")}
          >
            <Icon 
              name="devices" 
              size={22} 
              color={activeTab === "devices" ? "#6C63FF" : "#90A4AE"} 
            />
            <CustomText 
              style={[
                styles.tabText,
                activeTab === "devices" && styles.activeTabText,
              ]}
            >
              Devices
            </CustomText>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <Icon 
                name={activeTab === "people" ? "email" : "barcode-scan"} 
                size={20} 
                color="#607D8B" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={activeTab === "people" ? "Enter email address" : "Enter device ID"}
                placeholderTextColor="#90A4AE"
                value={activeTab === "people" ? email : deviceId}
                onChangeText={activeTab === "people" ? setEmail : setDeviceId}
                keyboardType={activeTab === "people" ? "email-address" : "default"}
                autoCapitalize="none"
              />
              {(activeTab === "people" && email.length > 0) || (activeTab === "devices" && deviceId.length > 0) ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => activeTab === "people" ? setEmail("") : setDeviceId("")}
                >
                  <Icon name="close-circle" size={18} color="#607D8B" />
                </TouchableOpacity>
              ) : null}
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={activeTab === "people" ? handleAddPerson : handleAddDevice}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="plus" size={20} color="#fff" />
                  <CustomText style={styles.addButtonText}>
                    Add {activeTab === "people" ? "Person" : "Device"}
                  </CustomText>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Suggested Section - Only for People tab */}
          {activeTab === "people" && (
            <View style={styles.suggestedSection}>
              <CustomText style={styles.sectionTitle}>Suggested</CustomText>
              
              {suggestedEmails.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedItem}
                  onPress={() => selectSuggestedEmail(item.email)}
                >
                  {item.avatar ? (
                    <View style={styles.avatarContainer}>
                      <BlurView intensity={70} style={styles.avatarBlur}>
                        <Icon name="account" size={22} color="#fff" />
                      </BlurView>
                    </View>
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="account" size={22} color="#fff" />
                    </View>
                  )}
                  
                  <View style={styles.suggestedInfo}>
                    <CustomText style={styles.suggestedName}>{item.name}</CustomText>
                    <CustomText style={styles.suggestedEmail}>{item.email}</CustomText>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.suggestedAddButton}
                    onPress={() => {
                      setEmail(item.email);
                      handleAddPerson();
                    }}
                  >
                    <Icon name="plus" size={18} color="#6C63FF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Recently Added Section */}
          {recentlyAdded.length > 0 && (
            <View style={styles.recentSection}>
              <CustomText style={styles.sectionTitle}>Recently Added</CustomText>
              
              {recentlyAdded.map((item) => (
                <View key={item.id} style={styles.recentItem}>
                  <View style={styles.recentIconContainer}>
                    <Icon 
                      name={item.type === "person" ? "account" : "cellphone"} 
                      size={20} 
                      color="#fff" 
                    />
                  </View>
                  
                  <View style={styles.recentInfo}>
                    <CustomText style={styles.recentPrimary}>
                      {item.email || item.deviceId}
                    </CustomText>
                    <View style={styles.recentMeta}>
                      <Icon name="clock-outline" size={12} color="#90A4AE" />
                      <CustomText style={styles.recentTime}>
                        {formatTimeSince(item.addedAt)}
                      </CustomText>
                    </View>
                  </View>
                  
                  <View style={styles.successIndicator}>
                    <Icon name="check-circle" size={20} color="#4CAF50" />
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionCard}>
              <Icon name="information-outline" size={24} color="#6C63FF" />
              <CustomText style={styles.instructionTitle}>
                How it works
              </CustomText>
              <CustomText style={styles.instructionText}>
                {activeTab === "people" 
                  ? "When you add a person by email, they will receive a notification and can accept or decline access to their location within this geofence."
                  : "When you add a device by ID, it will be tracked within this geofence and you'll receive notifications based on your geofence settings."
                }
              </CustomText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#263238",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#263238",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  placeholderButton: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: "rgba(108, 99, 255, 0.1)",
  },
  tabText: {
    fontSize: 14,
    color: "#90A4AE",
    marginLeft: 8,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#6C63FF",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECEFF1",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#263238",
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  suggestedSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#263238",
    marginBottom: 12,
  },
  suggestedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBlur: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#263238",
  },
  suggestedEmail: {
    fontSize: 12,
    color: "#607D8B",
  },
  suggestedAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  recentSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  recentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentPrimary: {
    fontSize: 14,
    fontWeight: "500",
    color: "#263238",
  },
  recentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  recentTime: {
    fontSize: 12,
    color: "#90A4AE",
    marginLeft: 4,
  },
  successIndicator: {
    marginLeft: 8,
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#263238",
    marginTop: 8,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AddEntityToGeofenceScreen;
