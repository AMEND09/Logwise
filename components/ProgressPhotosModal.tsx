import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView, Platform, FlatList } from 'react-native';
import showAlert from '../utils/showAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, Image as ImageIcon, Calendar, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useData } from '@/contexts/DataContext';
import { ProgressPhoto } from '@/types';

interface ProgressPhotosModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProgressPhotosModal: React.FC<ProgressPhotosModalProps> = ({
  visible,
  onClose,
}) => {
  const { data, addProgressPhoto, deleteProgressPhoto } = useData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progressPhotos = data?.progress_photos || [];

  useEffect(() => {
    if (visible) {
      requestPermissions();
    }
  }, [visible]);

  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    

    if (typeof window === 'undefined') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        const title = 'Camera Permission';
        const message = 'Camera access is needed to take progress photos.';
    showAlert(title, message);
        return false;
      }
    }
    
    if (mediaStatus !== 'granted') {
      const title = 'Media Library Permission';
      const message = 'Photo library access is needed to save and select progress photos.';
      showAlert(title, message);
      return false;
    }
    
    return true;
  };

  const saveImageForPlatform = async (imageUri: string): Promise<string> => {
    if (typeof window !== 'undefined') {
      return imageUri;
    }
    return imageUri;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
  showAlert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
  showAlert('Error', 'Failed to select photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const savedImageUri = await saveImageForPlatform(selectedImage);
      
      const newPhoto: ProgressPhoto = {
        id: Date.now().toString(),
        imageUri: savedImageUri,
        date: new Date().toISOString(),
      };
      
      await addProgressPhoto(newPhoto);
      
  showAlert('Success', 'Progress photo saved!');
  showAlert('Success', 'Progress photo saved!');
      setSelectedImage(null);
      onClose();
    } catch (error) {
      console.error('Error saving photo:', error);
  showAlert('Error', 'Failed to save progress photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    const title = 'Delete Photo';
    const message = 'Are you sure you want to delete this progress photo?';

    showAlert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProgressPhoto(photoId) }
    ]);
  };

  const renderPhotoItem = ({ item }: { item: ProgressPhoto }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.imageUri }} style={styles.photoThumbnail} />
      <Text style={styles.photoDate}>
        {new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}
      </Text>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeletePhoto(item.id)}
      >
        <Trash2 color="#ef4444" size={16} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle={typeof window !== 'undefined' ? 'fullScreen' : 'pageSheet'}
    >
      <SafeAreaView style={styles.container} edges={typeof window !== 'undefined' ? [] : ['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress Photos</Text>
          {selectedImage && (
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, loading && styles.disabledButton]}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
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
                disabled={loading}
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
                {typeof window === 'undefined' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, loading && styles.disabledButton]} 
                    onPress={takePhoto}
                    disabled={loading}
                  >
                    <Camera color="#ffffff" size={24} />
                    <Text style={styles.actionButtonText}>
                      {loading ? 'Opening Camera...' : 'Take Photo'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.secondaryButton, loading && styles.disabledButton]} 
                  onPress={selectFromGallery}
                  disabled={loading}
                >
                  <ImageIcon color="#059669" size={24} />
                  <Text style={styles.secondaryButtonText}>
                    {loading ? 'Opening Gallery...' : 'Choose from Gallery'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recentSection}>
                <Text style={styles.recentTitle}>Progress Gallery</Text>
                {progressPhotos.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyPhotoSlot}>
                      <Calendar color="#d1d5db" size={32} />
                      <Text style={styles.emptyPhotoText}>No photos yet</Text>
                    </View>
                    <Text style={styles.recentSubtext}>
                      Your progress photos will appear here
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={progressPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                    renderItem={renderPhotoItem}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    columnWrapperStyle={progressPhotos.length >= 3 ? styles.photoRow : undefined}
                    showsVerticalScrollIndicator={false}
                  />
                )}
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
  disabledButton: {
    backgroundColor: '#9ca3af',
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
  emptyState: {
    alignItems: 'center',
  },
  photoRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  photoThumbnail: {
    width: 80,
    height: 106,
    borderRadius: 8,
    marginBottom: 4,
  },
  photoDate: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
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
    marginTop: 12,
  },
});
