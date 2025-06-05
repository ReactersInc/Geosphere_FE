import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useUser } from '../context/userContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { UseApi } from '../hooks/UseApi';
import { useToast } from '../component/ToastProvider';


const { height, width } = Dimensions.get('window');

const PeopleScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const api = UseApi();

  const {showToast} = useToast();

  const tabBarHeight = useBottomTabBarHeight();

  
  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts/all');
console.log("the response is", response.data);
      
  if (response.data != undefined) {
    setContacts(response.data.list);
    setFilteredContacts(response.data.data.list);
  } else {
    console.error('Failed to fetch contacts:', response.data.result.message);
    showToast({
      type: 'error',
      message: response.data.result.message || 'Failed to fetch contacts',
      position: 'top',
      duration: 3000,
    });
  }
  } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  
  useFocusEffect(
      useCallback(() => {
       fetchContacts();
      }, [])
    );


  
  useEffect(() => {
    if (searchText) {
      const filtered = contacts.filter(contact => 
        contact.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchText, contacts]);

  
  const getPersonColor = (name) => {
    const charCode = name.charCodeAt(0);
    const hue = (charCode * 15) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Get person's full name
  const getFullName = (contact) => {
    return `${contact.firstName} ${contact.lastName}`.trim();
  };

  // Get person's initials
  const getInitials = (contact) => {
    const firstName = contact.firstName || '';
    const lastName = contact.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Render a person item
  const renderPersonItem = ({ item }) => {
    const fullName = getFullName(item);
    const personColor = getPersonColor(fullName);
    const initials = getInitials(item);
    
    return (
      <TouchableOpacity
        style={styles.personCard}
        onPress={() => navigation.navigate('PersonDetails', { person: item })}>
        <View style={styles.personInfo}>
          <View style={styles.personAvatarContainer}>
            {item.photo && item.photo !== 'http://google.com@shreeram' ? (
              <Image 
                source={{ uri: item.photo }} 
                style={styles.personAvatarImage}
                onError={() => {
                  // Handle image load error by showing initials
                }}
              />
            ) : (
              <View style={[styles.personAvatar, { backgroundColor: personColor }]}>
                <CustomText style={styles.personInitial}>
                  {initials}
                </CustomText>
              </View>
            )}
          </View>
          <View style={styles.personDetails}>
            <View style={styles.personNameRow}>
              <CustomText style={styles.personName}>{fullName}</CustomText>
            </View>
            <View style={styles.emailRow}>
              <Icon name="email" size={14} color="#666" />
              <CustomText style={styles.emailText}>{item.email}</CustomText>
            </View>
          </View>
        </View>
        <View style={styles.personActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // Handle contact action (call, message, etc.)
            }}>
            <Icon name="message" size={18} color="#6C63FF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <CustomText style={styles.loadingText}>Loading contacts...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {
      paddingBottom: tabBarHeight,
    }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <CustomText style={styles.screenTitle}>People</CustomText>
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={() => navigation.navigate('PeopleSettings')}>
            <Icon name="dots-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.contactsHeader}>
          <CustomText style={styles.contactsCount}>
            {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}
          </CustomText>
          <TouchableOpacity onPress={fetchContacts}>
            <Icon name="refresh" size={20} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredContacts}
          renderItem={renderPersonItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.peopleList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-search" size={64} color="#ccc" />
              <CustomText style={styles.emptyText}>No contacts found</CustomText>
              <CustomText style={styles.emptySubText}>
                {searchText ? 'Try adjusting your search' : 'No contacts available'}
              </CustomText>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UserDiscoveryScreen')}>
          <LinearGradient
            colors={['#6C63FF', '#5046e5']}
            style={styles.addButtonGradient}>
            <Icon name="plus" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Manrope-Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  screenTitle: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  optionsButton: {
    padding: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Manrope-Medium',
    padding: 4,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  contactsCount: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  peopleList: {
    paddingBottom: 20,
  },
  personCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatarContainer: {
    marginRight: 12,
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  personInitial: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Manrope-Bold',
  },
  personDetails: {
    flex: 1,
  },
  personNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  personName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginLeft: 6,
    flex: 1,
  },
  personActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0FF',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Manrope-SemiBold',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Manrope-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default PeopleScreen;