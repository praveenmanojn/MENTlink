/**
 * AskDoubtScreen — Student — PeerLink
 * Form to post a doubt — all fields on a large white sticky note.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology', 'English'];

const AskDoubtScreen = () => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setTitle(''); setDescription('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Page header */}
          <Text style={styles.pageTitle}>Ask a Doubt</Text>
          <Text style={styles.pageSub}>Post your question</Text>

          {/* Main form card */}
          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinBlack} size={22} /></View>
            <View style={styles.card}>

              {/* Subject dropdown */}
              <Text style={styles.fieldLabel}>Subject</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setDropOpen(!dropOpen)}>
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

              <TextInput label="Title" placeholder="e.g. Quadratic Equation Doubt" value={title} onChangeText={setTitle} />

              {/* Multiline description */}
              <Text style={styles.fieldLabel}>Description</Text>
              <View style={styles.textareaContainer}>
                <TextInput
                  placeholder="Type your question here..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  style={styles.textarea}
                />
              </View>

              {/* Upload image */}
              <Text style={styles.fieldLabel}>Upload Image (optional)</Text>
              <TouchableOpacity style={styles.uploadBox}>
                <Text style={styles.uploadIcon}>⊞</Text>
                <Text style={styles.uploadText}>Tap to upload image</Text>
              </TouchableOpacity>

              {submitted && (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>✓ Doubt posted! Mentors will respond soon.</Text>
                </View>
              )}

              <Button
                title="Submit Doubt →"
                onPress={handleSubmit}
                variant="danger"
                size="lg"
                style={styles.submitBtn}
              />
            </View>
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },

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

  fieldLabel: { fontFamily: FontFamily.semiBold, fontSize: FontSize.sm, color: Colors.inkDark, marginBottom: 6 },

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

  textareaContainer: { marginBottom: 14 },
  textarea: { minHeight: 110, textAlignVertical: 'top' },

  uploadBox: {
    borderWidth: 2, borderColor: Colors.borderLight, borderStyle: 'dashed',
    borderRadius: Radius.md, padding: 20, alignItems: 'center', marginBottom: 18,
    backgroundColor: Colors.paperCream,
  },
  uploadIcon: { fontSize: 32, color: Colors.inkLight, marginBottom: 6 },
  uploadText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkLight },

  successBanner: {
    backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, padding: 12, marginBottom: 14,
  },
  successText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, textAlign: 'center' },

  submitBtn: { width: '100%' },
});

export default AskDoubtScreen;