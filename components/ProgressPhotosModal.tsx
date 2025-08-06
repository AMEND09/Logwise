import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, Image as ImageIcon, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useData } from '@/contexts/DataContext';

interface ProgressPhotosModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProgressPhotosModal: React.FC<ProgressPhotosModalProps> = ({
  visible,
  onClose,
}) => {
  const { data } = useData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to save your progress photos.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      // Here you would typically save the image to your data store
      // For now, we'll just show it in the modal
      Alert.alert('Success', 'Progress photo captured! This would be saved to your progress gallery.');
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      Alert.alert('Success', 'Progress photo selected! This would be saved to your progress gallery.');
    }
  };

  const handleSave = () => {
    if (selectedImage) {
      // Here you would save the image with current date to your data store
      // For now, we'll just close the modal
      onClose();
      setSelectedImage(null);
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle={Platform.OS === 'web' ? 'fullScreen' : 'pageSheet'}
    >
      <SafeAreaView style={styles.container} edges={Platform.OS === 'web' ? [] : ['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress Photos</Text>
          {selectedImage && (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {selectedImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Text style={styles.previewDate}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <TouchableOpacity 
                style={styles.retakeButton} 
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.retakeButtonText}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.captureContainer}>
              <View style={styles.instructions}>
                <ImageIcon color="#9ca3af" size={64} />
                <Text style={styles.instructionsTitle}>Capture Your Progress</Text>
                <Text style={styles.instructionsText}>
                  Take consistent photos to track your transformation journey.
                  Try to use the same lighting, pose, and background for better comparison.
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                  <Camera color="#ffffff" size={24} />
                  <Text style={styles.actionButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={selectFromGallery}>
                  <ImageIcon color="#059669" size={24} />
                  <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Recent Progress Photos Preview */}
              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Recent Progress</Text>
                <View style={styles.recentGrid}>
                  <View style={styles.emptyPhotoSlot}>
                    <Calendar color="#d1d5db" size={32} />
                    <Text style={styles.emptyPhotoText}>No photos yet</Text>
                  </View>
                </View>
                <Text style={styles.recentSubtext}>
                  Your progress photos will appear here
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    ...(Platform.OS === 'web' ? {
      height: '100vh' as any,
      maxHeight: '100vh' as any,
    } : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    padding: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: 250,
    height: 333,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewDate: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  retakeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 16,
  },
  captureContainer: {
    padding: 20,
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 40,
    ...(Platform.OS === 'web' ? {
      paddingBottom: 60,
    } : {}),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#059669',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#059669',
    fontSize: 18,
    fontWeight: '600',
  },
  recentSection: {
    marginTop: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  emptyPhotoSlot: {
    width: 100,
    height: 133,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPhotoText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  recentSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
