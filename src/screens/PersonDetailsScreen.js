import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomText from "../component/CustomText";
import { LinearGradient } from "expo-linear-gradient";

const PersonDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { person } = route.params;

  // Generate consistent color based on contact name
  const charCode =
    person.firstName && person.firstName.length > 1
      ? person.firstName.charCodeAt(1)
      : person.lastName && person.lastName.length > 1
      ? person.lastName.charCodeAt(1)
      : 65; // Default to 'A' if no name

  const hue = (charCode * 15) % 360;
  const personColor = `hsl(${hue}, 70%, 60%)`;

  const isValidUrl =
    person.photo && person.photo.startsWith("http") && !person.photo.includes("@");

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${person.email}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#6C63FF" />
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>Contact Details</CustomText>
          <View style={styles.headerRight} />
        </View>

        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {person.photo ? (
              isValidUrl ? (
                <Image source={{ uri: person.photo }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[personColor, personColor]}
                  style={styles.avatarFallback}
                >
                  <CustomText style={styles.avatarInitial}>
                    {person.firstName.charAt(0).toUpperCase()}
                  </CustomText>
                </LinearGradient>
              )
            ) : (
              <LinearGradient
                colors={[personColor, personColor]}
                style={styles.avatarFallback}
              >
                <CustomText style={styles.avatarInitial}>
                  {person.firstName.charAt(0).toUpperCase()}
                </CustomText>
              </LinearGradient>
            )}
          </View>

          <CustomText style={styles.name}>
            {person.firstName} {person.lastName}
          </CustomText>

          <TouchableOpacity
            style={styles.emailContainer}
            onPress={handleEmailPress}
          >
            <Icon name="email-outline" size={20} color="#6C63FF" />
            <CustomText style={styles.email}>{person.email}</CustomText>
          </TouchableOpacity>
        </View>

        {/* Details section */}
        <View style={styles.detailsSection}>
          {/* Basic Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="account-outline" size={20} color="#6C63FF" />
              <CustomText style={styles.cardTitle}>Basic Information</CustomText>
            </View>

            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>First Name</CustomText>
              <CustomText style={styles.infoValue}>{person.firstName}</CustomText>
            </View>

            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>Last Name</CustomText>
              <CustomText style={styles.infoValue}>{person.lastName}</CustomText>
            </View>

            <View style={styles.infoRow}>
              <CustomText style={styles.infoLabel}>Contact ID</CustomText>
              <CustomText style={styles.infoValue}>{person.id}</CustomText>
            </View>
          </View>

          {/* Actions Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="dots-horizontal" size={20} color="#6C63FF" />
              <CustomText style={styles.cardTitle}>Actions</CustomText>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="message-text-outline" size={20} color="#6C63FF" />
              <CustomText style={styles.actionButtonText}>
                Send Message
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="phone-outline" size={20} color="#6C63FF" />
              <CustomText style={styles.actionButtonText}>
                Call Contact
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Icon name="map-marker-outline" size={20} color="#6C63FF" />
              <CustomText style={styles.actionButtonText}>
                View Shared Locations
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerRight: {
    width: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: "600",
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  detailsSection: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#1A1A1A",
    marginLeft: 12,
  },
});

export default PersonDetailsScreen;