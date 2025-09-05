import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';

type TimePickerFieldProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
};

export function TimePickerField({
  label,
  value,
  onChange,
  error,
}: TimePickerFieldProps) {
  const [show, setShow] = useState(false);
  // Remove unused timeObj state

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>{label}</Text>
      <TouchableOpacity onPress={() => setShow(true)}>
        <View pointerEvents="none">
          <View style={styles.inputFake}>
            <Text style={{ color: value ? '#111827' : '#9CA3AF' }}>
              {value ? value : 'Selecione o horário'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={show}
        mode="time"
        onConfirm={(date: Date) => {
          setShow(false);
          onChange(format(date, 'HH:mm'));
        }}
        onCancel={() => setShow(false)}
        locale="pt-BR"
      />
      {error ? (
        <Text style={{ color: '#EF4444', fontSize: 12 }}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputFake: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 4,
  },
});
