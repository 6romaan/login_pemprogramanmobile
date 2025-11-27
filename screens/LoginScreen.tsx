import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithPopup,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { auth } from '../firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
    navigation?: any;
}

// Google OAuth Client ID - HARUS dari Firebase project yang sama (project_number: 983899879214)
// Dapatkan dari: Firebase Console > Authentication > Sign-in method > Google > Web client ID
const GOOGLE_CLIENT_ID: string = '983899879214-1caecl2sst4upl79q67h5e56h5b0kqlv.apps.googleusercontent.com';


export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);


    // Email/Password Auth
    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                Alert.alert('Success', 'Account created successfully!');
            }
        } catch (error: any) {
            let errorMessage = 'An error occurred';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'User not found';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Wrong password';
            } else {
                errorMessage = error.message || 'An error occurred';
            }
            Alert.alert('Authentication Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Google Auth - menggunakan signInWithPopup untuk web
    const handleGoogleSignIn = async () => {
        console.log('=== GOOGLE SIGN IN CLICKED ===');
        console.log('Platform:', Platform.OS);

        setLoading(true);
        
        try {
            if (Platform.OS === 'web') {
                // Untuk Web - gunakan signInWithPopup
                console.log('Using signInWithPopup for web...');
                const provider = new GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');
                
                const result = await signInWithPopup(auth, provider);
                console.log('✅ Google Sign In Success!');
                console.log('User:', result.user.email);
                // Navigation akan di-handle oleh onAuthStateChanged di App.js
            } else {
                // Untuk Native (iOS/Android) - gunakan expo-auth-session
                console.log('Using expo-auth-session for native...');
                
                if (GOOGLE_CLIENT_ID.includes('PASTE_YOUR') || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
                    Alert.alert(
                        'Konfigurasi Diperlukan',
                        'Google Client ID belum dikonfigurasi untuk native app!'
                    );
                    setLoading(false);
                    return;
                }
                
                const redirectUri = AuthSession.makeRedirectUri({
                    scheme: 'tempapp',
                });
                
                console.log('Redirect URI:', redirectUri);
                
                // Generate nonce for IdToken flow
                const nonce = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    Math.random().toString(36) + Date.now().toString()
                );
                
                const request = new AuthSession.AuthRequest({
                    clientId: GOOGLE_CLIENT_ID,
                    scopes: ['openid', 'profile', 'email'],
                    responseType: AuthSession.ResponseType.IdToken,
                    redirectUri: redirectUri,
                    usePKCE: false,
                    extraParams: {
                        nonce: nonce,
                    },
                });

                const result = await request.promptAsync({
                    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
                });

                if (result.type === 'success') {
                    const idToken = result.params.id_token;
                    if (idToken) {
                        const credential = GoogleAuthProvider.credential(idToken);
                        await signInWithCredential(auth, credential);
                        console.log('✅ Google Sign In Success!');
                    } else {
                        throw new Error('No id_token received');
                    }
                } else if (result.type === 'dismiss') {
                    console.log('User cancelled Google sign in');
                } else {
                    throw new Error('Google sign in failed');
                }
            }
        } catch (error: any) {
            console.error('❌ Google Sign In Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Gagal login dengan Google';
            
            if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                console.log('User cancelled');
                setLoading(false);
                return;
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup diblokir browser. Izinkan popup untuk situs ini.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert('Login Gagal', errorMessage);
        } finally {
            setLoading(false);
            console.log('Google Auth process finished');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="auto" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                editable={!loading}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoComplete="password"
                                editable={!loading}
                            />
                        </View>

                        {/* Email/Password Button */}
                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.buttonDisabled]}
                            onPress={handleEmailAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity
                            style={[styles.socialButton, styles.googleButton, loading && styles.buttonDisabled]}
                            onPress={() => {
                                console.log('Google button pressed');
                                if (!loading) {
                                    handleGoogleSignIn();
                                }
                            }}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <View style={styles.socialButtonContent}>
                                <Text style={styles.googleIcon}>G</Text>
                                <Text style={styles.socialButtonText}>Continue with Google</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Toggle Login/Register */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} disabled={loading}>
                            <Text style={styles.toggleText}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 4,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        color: '#333',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#007AFF',
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
                boxShadow: '0 4px 4.65px rgba(0, 122, 255, 0.3)',
            },
        }),
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 14,
        fontWeight: '500',
    },
    socialButton: {
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)',
            },
        }),
    },
    googleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    socialButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4285F4',
        marginRight: 12,
        backgroundColor: '#f0f0f0',
        width: 28,
        height: 28,
        borderRadius: 0,
        textAlign: 'center',
        lineHeight: 28,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    toggleText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
