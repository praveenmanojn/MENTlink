/**
 * PaperSearchBar
 * Search input that looks like a notebook search field.
 */
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && styles.focused,
        style,
      ]}
    >
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.inkFaint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value.length > 0 && (
        <Text style={styles.clear} onPress={() => onChangeText('')}>✕</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paperWhite,
    borderWidth: 2.5,
    borderColor: Colors.borderInk,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  focused: {
    borderColor: Colors.pinBlue,
  },
  icon: {
    fontSize: 20,
    color: Colors.inkMedium,
    marginRight: 8,
    lineHeight: 24,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.inkBlack,
    padding: 0,
  },
  clear: {
    fontSize: FontSize.sm,
    color: Colors.inkMedium,
    paddingLeft: 8,
  },
});

export default SearchBar;