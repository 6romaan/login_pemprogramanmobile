import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const navigationRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('App.js - Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
            setUser(user);
            if (initializing) setInitializing(false);
            
            // Navigate based on auth state - wait for navigation to be ready
            const navigate = () => {
                if (navigationRef.current) {
                    if (user) {
                        console.log('App.js - Navigating to Home');
                        navigationRef.current.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    } else {
                        console.log('App.js - Navigating to Login');
                        navigationRef.current.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                } else {
                    console.warn('App.js - Navigation ref not ready, retrying...');
                    setTimeout(navigate, 100);
                }
            };
            
            if (!initializing) {
                navigate();
            }
        });
        return unsubscribe;
    }, [initializing]);

    if (initializing) {
        return (
            <SafeAreaProvider>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                    }}
                    initialRouteName={user ? 'Home' : 'Login'}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
});
