/**
 * PaperInput
 * Text inputs that look like lines on a notebook page.
 * Thick 2px border, warm background, label above.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

interface PaperInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const TextInput: React.FC<PaperInputProps> = ({
  label,
  error,
  containerStyle,
  rightIcon,
  onRightIconPress,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <View style={[styles.inputContainer, focused && styles.inputFocused, error ? styles.inputError : null]}>
        <RNTextInput
          style={styles.input}
          placeholderTextColor={Colors.inkFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.inkDark,
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paperWhite,
    borderWidth: 2,
    borderColor: Colors.borderInk,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    // Flat shadow
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  inputFocused: {
    borderColor: Colors.pinBlue,
    shadowColor: Colors.pinBlue,
  },
  inputError: {
    borderColor: Colors.statusError,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.inkBlack,
    paddingVertical: 12,
    minHeight: 46,
  },
  rightIcon: {
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.statusError,
    marginTop: 4,
  },
});

export default TextInput;