/**
 * AskDoubtScreen — Student — PeerLink
 * Post a doubt with image picked directly from Local Storage & uploaded to Supabase.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Image,
  KeyboardAvoidingView, Platform, Alert, TextInput as RNTextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { supabase } from '../../services/supabase/client';
import { useAuthStore } from '../../store/authStore';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'History', 'Economics',
];

const AskDoubtScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dropOpen, setDropOpen] = useState(false);

  // Local storage image state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlOption, setShowUrlOption] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Safe helper to attempt requiring expo-image-picker without crashing the app
  const getNativeImagePicker = () => {
    try {
      const picker = require('expo-image-picker');
      return picker;
    } catch (e) {
      console.warn('Native ImagePicker module load error:', e);
      return null;
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 1. Pick Image from Local Device Storage
  // ──────────────────────────────────────────────────────────────
  const pickFromLocalStorage = async () => {
    setImageLoading(true);
    setErrorMsg('');

    try {
      const ImagePicker = getNativeImagePicker();

      if (ImagePicker && typeof ImagePicker.launchImageLibraryAsync === 'function') {
        try {
          if (typeof ImagePicker.requestMediaLibraryPermissionsAsync === 'function') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Gallery access is needed to pick an image from local storage.');
              setImageLoading(false);
              return;
            }
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'images',
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
          });

          if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setImageUri(asset.uri);
            setImageBase64(asset.base64 || null);
            setImageLoading(false);
            return;
          }
        } catch (innerErr) {
          console.warn('launchImageLibraryAsync execution error:', innerErr);
        }
      }

      // Fallback if native module is incompatible in user's current Expo Go version
      setShowUrlOption(true);
      Alert.alert(
        'Image Upload Option',
        'Native device picker isn\'t supported by this Expo Go build. You can paste an image URL directly below.',
      );
    } catch (err: any) {
      console.warn('Pick from local storage error:', err);
      setShowUrlOption(true);
    } finally {
      setImageLoading(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setUrlInput('');
  };

  // ──────────────────────────────────────────────────────────────
  // 2. Upload image to Supabase Storage (or Data URI fallback)
  // ──────────────────────────────────────────────────────────────
  const uploadImageToSupabase = async (): Promise<string | null> => {
    if (!imageUri) return null;

    // If user entered a remote web URL
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      return imageUri;
    }

    if (!supabase) return null;

    try {
      const fileName = `doubt-${Date.now()}-${user?.id || 'anon'}.jpg`;

      // Method A: Upload using base64 Uint8Array if base64 is available
      if (imageBase64) {
        const binaryStr = atob(imageBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const { error: uploadError } = await supabase.storage
          .from('doubt-images')
          .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('doubt-images')
            .getPublicUrl(fileName);
          if (urlData?.publicUrl) return urlData.publicUrl;
        } else {
          console.warn('Storage upload error:', uploadError.message);
        }

        // Fallback: Return base64 data URI (displays everywhere in RN/Web)
        return `data:image/jpeg;base64,${imageBase64}`;
      }

      // Method B: Upload via fetch arrayBuffer if local file URI
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const uint8 = new Uint8Array(arrayBuffer);
      const { error: uploadErr } = await supabase.storage
        .from('doubt-images')
        .upload(fileName, uint8, { contentType: 'image/jpeg', upsert: true });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from('doubt-images')
          .getPublicUrl(fileName);
        if (urlData?.publicUrl) return urlData.publicUrl;
      }
    } catch (e) {
      console.warn('Upload image exception:', e);
      if (imageBase64) return `data:image/jpeg;base64,${imageBase64}`;
    }

    return imageUri;
  };

  // ──────────────────────────────────────────────────────────────
  // 3. Submit doubt to Supabase
  // ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a title for your doubt.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please describe your doubt in detail.');
      return;
    }
    if (!user?.id) {
      setErrorMsg('You must be logged in to post a doubt.');
      return;
    }

    setUploading(true);

    try {
      // Upload image to Supabase
      let uploadedUrl: string | null = null;
      if (imageUri) {
        uploadedUrl = await uploadImageToSupabase();
      }

      if (!supabase) throw new Error('Supabase client not available.');

      // ── Ensure student profile exists (prevents FK violation on questions.student_id)
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Student',
        role: 'student',
      }, { onConflict: 'id', ignoreDuplicates: true });

      // Insert question into public.questions table
      const { data: newQ, error: insertError } = await supabase
        .from('questions')
        .insert({
          student_id: user.id,
          subject,
          title: title.trim(),
          description: description.trim(),
          image_url: uploadedUrl,
          status: 'waiting',
        })
        .select()
        .single();

      if (insertError) {
        setErrorMsg(`Failed to post doubt: ${insertError.message}`);
        return;
      }

      // Success
      setSubmitted(true);
      setTitle('');
      setDescription('');
      removeImage();

      setTimeout(() => {
        setSubmitted(false);
        if (newQ?.id) {
          (navigation as any).navigate('Chat', {
            questionId: newQ.id,
            openChatWith: 'Waiting for Mentor...',
          });
        } else {
          navigation.goBack();
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.pageTitle}>Ask a Doubt</Text>
            <Text style={styles.pageSub}>Post your question — mentors see it instantly ✏️</Text>

            <View style={styles.cardWrapper}>
              <View style={styles.pin}><PinWidget color={Colors.pinBlack} size={22} /></View>
              <View style={styles.card}>

                {/* Subject Dropdown */}
                <Text style={styles.fieldLabel}>Subject *</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setDropOpen(!dropOpen)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dropdownValue}>{subject}</Text>
                  <Text style={styles.dropdownArrow}>{dropOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {dropOpen && (
                  <View style={styles.dropdownList}>
                    {SUBJECTS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.dropdownItem, s === subject && styles.dropdownItemActive]}
                        onPress={() => { setSubject(s); setDropOpen(false); }}
                      >
                        <Text style={styles.dropdownItemText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Title */}
                <View style={{ marginBottom: 4 }}>
                  <TextInput
                    label="Title *"
                    placeholder="e.g. How to solve quadratic equations?"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                {/* Description */}
                <Text style={styles.fieldLabel}>Describe Your Doubt *</Text>
                <View style={styles.textareaContainer}>
                  <TextInput
                    placeholder="Explain in detail. What have you tried? What's confusing you?"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={5}
                    style={styles.textarea}
                  />
                </View>

                {/* ── Image Upload from Local Storage ── */}
                <Text style={styles.fieldLabel}>📷 Attach Image (optional)</Text>
                <Text style={styles.fieldHint}>
                  Upload a photo of your textbook, problem sheet, or working from your device
                </Text>

                {imageUri ? (
                  <View style={styles.imagePreviewBox}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.imageFooter}>
                      <Text style={styles.imageStatus} numberOfLines={1}>
                        ✅ Image ready to upload to Supabase
                      </Text>
                      <TouchableOpacity onPress={removeImage} style={styles.removeImageBtn}>
                        <Text style={styles.removeImageText}>✕ Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ marginBottom: 18 }}>
                    <TouchableOpacity
                      style={styles.uploadBox}
                      onPress={pickFromLocalStorage}
                      activeOpacity={0.8}
                      disabled={imageLoading}
                    >
                      {imageLoading ? (
                        <View style={styles.loadingBox}>
                          <Text style={styles.loadingIcon}>⏳</Text>
                          <Text style={styles.loadingText}>Opening gallery...</Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.uploadIcon}>📁</Text>
                          <Text style={styles.uploadTitle}>Choose Photo from Device Storage</Text>
                          <Text style={styles.uploadSub}>Select a photo from your gallery or files</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    {showUrlOption && (
                      <View style={styles.urlFallbackBox}>
                        <Text style={styles.urlFallbackTitle}>Or paste image URL:</Text>
                        <RNTextInput
                          style={styles.urlInput}
                          placeholder="https://i.imgur.com/example.jpg"
                          placeholderTextColor={Colors.inkLight}
                          value={urlInput}
                          onChangeText={(text) => {
                            setUrlInput(text);
                            if (text.trim().startsWith('http')) setImageUri(text.trim());
                          }}
                          autoCapitalize="none"
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Error Banner */}
                {errorMsg ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                  </View>
                ) : null}

                {/* Success Banner */}
                {submitted && (
                  <View style={styles.successBanner}>
                    <Text style={styles.successText}>
                      ✓ Doubt & image posted! Mentors can view it right now.
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <Button
                  title={uploading ? 'Uploading & Posting...' : 'Post Doubt →'}
                  onPress={handleSubmit}
                  variant="danger"
                  size="lg"
                  disabled={uploading}
                  style={{ width: '100%' }}
                />

                {uploading && (
                  <View style={styles.uploadingRow}>
                    <Text style={styles.uploadingSpinner}>⏳</Text>
                    <Text style={styles.uploadingText}>
                      {imageUri ? 'Uploading image & saving...' : 'Saving doubt to Supabase...'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ height: 80 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },

  backBtn: { marginBottom: 14 },
  backText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },

  pageTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 22 },

  cardWrapper: { alignItems: 'center' },
  pin: { marginBottom: -11, zIndex: 10 },
  card: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 22, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },

  fieldLabel: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.inkDark, marginBottom: 4, marginTop: 4 },
  fieldHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkMedium, marginBottom: 10 },

  dropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.paperWhite, borderWidth: 2, borderColor: Colors.borderInk,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 12,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3, marginBottom: 14,
  },
  dropdownValue: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.inkBlack },
  dropdownArrow: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium },
  dropdownList: {
    backgroundColor: Colors.paperWhite, borderWidth: 2, borderColor: Colors.borderInk,
    borderRadius: Radius.md, marginTop: -10, marginBottom: 14, overflow: 'hidden',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownItemActive: { backgroundColor: Colors.stickyYellow },
  dropdownItemText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkBlack },

  textareaContainer: { marginBottom: 16 },
  textarea: { minHeight: 110, textAlignVertical: 'top' },

  uploadBox: {
    borderWidth: 2.5, borderColor: Colors.borderLight, borderStyle: 'dashed',
    borderRadius: Radius.md, paddingVertical: 24, paddingHorizontal: 16,
    alignItems: 'center', backgroundColor: Colors.paperCream,
  },
  uploadIcon: { fontSize: 36, marginBottom: 8 },
  uploadTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkDark, textAlign: 'center' },
  uploadSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkLight, marginTop: 4, textAlign: 'center' },

  urlFallbackBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  urlFallbackTitle: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkMedium, marginBottom: 4 },
  urlInput: {
    fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.inkBlack,
    borderWidth: 1.5, borderColor: Colors.borderLight, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 6, backgroundColor: Colors.paperWhite,
  },

  imagePreviewBox: {
    marginBottom: 18, borderRadius: Radius.md, overflow: 'hidden',
    borderWidth: 2.5, borderColor: Colors.borderBlack,
  },
  imagePreview: { width: '100%', height: 200 },
  imageFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.paperCream, borderTopWidth: 2, borderTopColor: Colors.borderBlack,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  imageStatus: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark, flex: 1 },
  removeImageBtn: {
    backgroundColor: Colors.stickyRed, borderWidth: 1.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.xs, paddingHorizontal: 8, paddingVertical: 4,
  },
  removeImageText: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.white },

  loadingBox: { alignItems: 'center', paddingVertical: 8 },
  loadingIcon: { fontSize: 28, marginBottom: 4 },
  loadingText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium },

  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10 },
  uploadingSpinner: { fontSize: 18 },
  uploadingText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium },

  errorBanner: {
    backgroundColor: Colors.stickyRed, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, padding: 12, marginBottom: 14,
  },
  errorText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white },

  successBanner: {
    backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, padding: 12, marginBottom: 14,
  },
  successText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, textAlign: 'center' },
});

export default AskDoubtScreen;