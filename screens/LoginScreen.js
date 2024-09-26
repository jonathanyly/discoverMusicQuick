import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Pressable, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Entypo } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResponseType, useAuthRequest } from 'expo-auth-session'
import { useNavigation } from '@react-navigation/native'

export default function LoginScreen() {
    const navigation = useNavigation()
    const [isAuthenticating, setIsAuthenticating] = useState(false)

    const discovery = {
        authorizationEndpoint: "https://accounts.spotify.com/authorize",
        tokenEndpoint: "https://accounts.spotify.com/api/token",
    };

    const [request, response, promptAsync] = useAuthRequest(
        {
            responseType: ResponseType.Code,
            clientId: 'CLIENTID',
            scopes: [
                'user-read-email',
                'user-library-read',
                'user-read-recently-played',
                'user-top-read',
                'playlist-read-private',
                'playlist-read-collaborative',
                'playlist-modify-public',
                'user-read-currently-playing',
                'user-read-playback-state',
                'user-modify-playback-state',
                'streaming',
                'user-read-private',
            ],
            usePKCE: true,
            redirectUri: "exp://localhost:19002/--/spotify-auth-callback",
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            exchangeCodeForToken(code);
        }
    }, [response]);

    async function exchangeCodeForToken(code){
        try {
            const tokenResponse = await fetch(discovery.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: request?.redirectUri,
                    client_id: request?.clientId,
                    code_verifier: request?.codeVerifier,
                }).toString(),
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.access_token && tokenData.refresh_token) {
                await AsyncStorage.setItem("accessToken", tokenData.access_token);
                await AsyncStorage.setItem("refreshToken", tokenData.refresh_token);
                const expTime = Date.now() + tokenData.expires_in * 1000;
                await AsyncStorage.setItem("expDate", expTime.toString());
                navigation.replace("Main");
            } else {
                throw new Error("Failed to get tokens");
            }
        } catch (error) {
            console.error("Token exchange error:", error);
            Alert.alert("Authentication failed", "An error occurred during token exchange.");
        }
        setIsAuthenticating(false);
    };

    const refreshAccessToken = async () => {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
            return false;
        }
        try {
            const tokenResponse = await fetch(discovery.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: request?.clientId
                }).toString(),
            });

            const tokenData = await tokenResponse.json();
            console.log(tokenData)

            if (tokenData.access_token) {
                await AsyncStorage.setItem("accessToken", tokenData.access_token);
                const expTime = Date.now() + tokenData.expires_in * 1000;
                await AsyncStorage.setItem("expDate", expTime.toString());
                if (tokenData.refresh_token) {
                    await AsyncStorage.setItem("refreshToken", tokenData.refresh_token);
                }
                return true;
            }
        } catch (error) {
            console.error("Token refresh error:", error);
        }
        return false;
    };

    useEffect(() => {
        const checkTokenValidity = async () => {
            const accessToken = await AsyncStorage.getItem("accessToken");
            const expDate = await AsyncStorage.getItem("expDate");             
            if (accessToken && expDate) {
                const currentTime = Date.now();
                if (currentTime < parseInt(expDate)) {
                    navigation.replace("Main");
                } else {
                    console.log("Access Token expired, refreshing...")
                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                        console.log("Refreshed Token")
                        navigation.replace("Main");
                    }
                }
            }
        };
        checkTokenValidity();
    }, []);

    async function authenticate() {
        try {
            setIsAuthenticating(true);
            await promptAsync();
        } catch (error) {
            console.error("Authentication error:", error);
            Alert.alert("Authentication failed", "An error occurred during authentication.");
            setIsAuthenticating(false);
        }
    }

    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{ height: 80 }} />
                <Entypo style={{ textAlign: 'center' }} name="spotify" size={80} color="white" />
                <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold', textAlign: "center", marginTop: 40 }}>
                    A new way to discover Music.
                </Text>
                <View style={{ height: 150 }} />
                <Pressable
                    onPress={authenticate}
                    disabled={isAuthenticating}
                    style={{
                        backgroundColor: isAuthenticating ? "#cccccc" : "#1DB954",
                        padding: 10,
                        marginLeft: "auto",
                        marginRight: "auto",
                        width: 300,
                        borderRadius: 25,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{ color: "black" }}>
                        {isAuthenticating ? "Authenticating..." : "Sign in with Spotify"}
                    </Text></Pressable>
            </SafeAreaView>
        </LinearGradient>
    )
}
