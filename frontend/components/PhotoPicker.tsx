import React, { useState, useEffect } from 'react';
import { router, RelativePathString } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { UseTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/theme/colors';


interface PhotoPickerProps {
    onPhotoSelected: (uris: string[]) => void;
    onGoBack: () => void;
}

export default function PhotoPicker({ onPhotoSelected, onGoBack }: PhotoPickerProps) {
    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Prístup zamietnutý', 'Musíte povoliť prístup do galérie.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            base64: false,
            quality: 0.5,
            allowsMultipleSelection: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            const uris = result.assets.map((asset) => asset.uri);
            onPhotoSelected(uris);
        }
    };

    const { isDarkMode } = UseTheme();
    const colors = getColors(isDarkMode);
    const { isAccessibilityMode } = UseTheme();

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Prístup zamietnutý', 'Musíte povoliť prístup ku kamere.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            onPhotoSelected([result.assets[0].uri]);
        }
    };

    const styles = StyleSheet.create({
        container: { padding: 24, flex:1, backgroundColor: colors.background, alignItems: 'center', },
        header: {
            fontSize: isAccessibilityMode ? 22 * 1.25 : 22,
            fontWeight: 'bold',
            marginBottom: 32,
            justifyContent: 'center',
            marginTop: 60,
            color: colors.textPrimary,
        },
        backButton: {
            position: 'absolute',
            top: 50,
            left: 20,
            zIndex: 1,
        },
        button: {
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            marginBottom: 16,
            alignItems: 'center',
            width: 330
        },
        buttonText: {
            color: '#fff',
            fontSize: isAccessibilityMode ? 16 * 1.25 : 16,
        },
    });

    return (
        <View style={styles.container}>

            <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.header}>Pridať fotku</Text>

            <TouchableOpacity style={styles.button} onPress={takePhoto}>
                <Text style={styles.buttonText}>Nová fotka</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={pickFromGallery}>
                <Text style={styles.buttonText}>Vybrať z galérie</Text>
            </TouchableOpacity>
        </View>
    );
}
