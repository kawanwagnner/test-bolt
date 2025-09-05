import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, style, secureTextEntry, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = typeof secureTextEntry !== 'undefined';
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={{ position: 'relative' }}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              error && styles.inputError,
              style,
              isPassword && { paddingRight: 44 },
            ]}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={isPassword ? !show : undefined}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShow((v) => !v)}
              accessibilityLabel={show ? 'Esconder senha' : 'Mostrar senha'}
            >
              {show ? (
                <EyeOff size={22} color="#6B7280" />
              ) : (
                <Eye size={22} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {helperText && !error && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: '100%',
    zIndex: 2,
  },
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});
