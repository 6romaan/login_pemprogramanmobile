import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Pressable,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    // Listen to auth state changes for logout
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('HomeScreen - Auth state changed:', user ? 'User exists' : 'User is null');
            if (!user) {
                // User logged out - navigate immediately
                console.log('HomeScreen - User logged out, navigating to Login');
                // Use navigation.replace for immediate navigation
                if (navigation) {
                    (navigation as any).replace('Login');
                }
            }
        });
        return unsubscribe;
    }, [navigation]);

    const handleLogout = async () => {
        console.log('=== LOGOUT BUTTON CLICKED ===');
        console.log('Current user:', auth.currentUser?.email);
        
        // Untuk web, gunakan window.confirm karena Alert.alert tidak selalu work
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to logout?');
            if (!confirmed) {
                console.log('Logout cancelled');
                return;
            }
        } else {
            // Untuk native, tetap gunakan Alert
            return new Promise<void>((resolve) => {
                Alert.alert(
                    'Logout',
                    'Are you sure you want to logout?',
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
                        { text: 'Logout', style: 'destructive', onPress: () => performLogout().then(resolve) },
                    ],
                    { cancelable: true }
                );
            });
        }
        
        // Lakukan logout untuk web
        await performLogout();
    };
    
    const performLogout = async () => {
        console.log('=== PERFORMING LOGOUT ===');
        setLoading(true);
        try {
            console.log('User before logout:', auth.currentUser?.email);
            
            // Sign out from Firebase
            await signOut(auth);
            
            console.log('SignOut completed');
            console.log('User after logout:', auth.currentUser);
            
            // Force navigation after logout
            if (navigation) {
                console.log('Navigating to Login...');
                (navigation as any).reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
            
        } catch (error: any) {
            console.error('Logout error:', error);
            if (Platform.OS === 'web') {
                window.alert(error.message || 'Failed to log out');
            } else {
                Alert.alert('Error', error.message || 'Failed to log out');
            }
        } finally {
            setLoading(false);
        }
    };

    const user = auth.currentUser;
    const userEmail = user?.email || 'User';
    const userName = user?.displayName || userEmail.split('@')[0];
    const userPhoto = user?.photoURL;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="auto" />
            <View style={styles.mainContainer}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    style={styles.scrollView}
                >
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.avatarContainer}>
                                {userPhoto ? (
                                    <Text style={styles.avatarText}>👤</Text>
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {userName.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.welcomeText}>Welcome back!</Text>
                            <Text style={styles.userName}>{userName}</Text>
                        </View>

                        {/* User Info Cards */}
                        <View style={styles.cardsContainer}>
                            <View style={styles.card}>
                                <Text style={styles.cardLabel}>Email</Text>
                                <Text style={styles.cardValue} numberOfLines={1}>
                                    {userEmail}
                                </Text>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardLabel}>User ID</Text>
                                <Text style={styles.cardValue} numberOfLines={1}>
                                    {user?.uid || 'N/A'}
                                </Text>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardLabel}>Provider</Text>
                                <Text style={styles.cardValue}>
                                    {user?.providerData[0]?.providerId === 'google.com'
                                        ? 'Google'
                                        : user?.providerData[0]?.providerId === 'facebook.com'
                                        ? 'Facebook'
                                        : 'Email/Password'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Logout Button - Fixed at bottom, outside ScrollView */}
                <View style={styles.logoutContainer} pointerEvents="box-none">
                    <View style={styles.logoutButtonWrapper}>
                        {Platform.OS === 'web' ? (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.logoutButton,
                                    loading && styles.buttonDisabled,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={() => {
                                    console.log('Pressable onPress triggered (Web)');
                                    if (!loading) {
                                        handleLogout();
                                    }
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.logoutButtonText}>Logout</Text>
                                )}
                            </Pressable>
                        ) : (
                            <TouchableOpacity
                                style={[styles.logoutButton, loading && styles.buttonDisabled]}
                                onPress={() => {
                                    console.log('TouchableOpacity onPress triggered');
                                    if (!loading) {
                                        handleLogout();
                                    }
                                }}
                                disabled={loading}
                                activeOpacity={0.7}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.logoutButtonText}>Logout</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    mainContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    logoutContainer: {
        padding: 24,
        paddingTop: 16,
        backgroundColor: '#f5f7fa',
        borderTopWidth: Platform.OS === 'web' ? 0 : 1,
        borderTopColor: '#e0e0e0',
    },
    logoutButtonWrapper: {
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 0,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#007AFF',
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 8px rgba(0, 122, 255, 0.3)',
            },
        }),
    },
    avatarText: {
        fontSize: 48,
        color: '#fff',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    userName: {
        fontSize: 18,
        color: '#666',
    },
    cardsContainer: {
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 4,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
        }),
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#FF3B30',
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 4.65px rgba(255, 59, 48, 0.3)',
            },
        }),
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

