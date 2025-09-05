import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format, parseISO } from 'date-fns';

type DatePickerFieldProps = {
  label: string;
  value: string; // expected YYYY-MM-DD
  onChange: (val: string) => void;
  error?: string;
};

export function DatePickerField({
  label,
  value,
  onChange,
  error,
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  const displayValue = value ? format(parseISO(value), 'dd/MM/yyyy') : '';

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>{label}</Text>
      <TouchableOpacity onPress={() => setShow(true)}>
        <View pointerEvents="none">
          <View style={styles.inputFake}>
            <Text style={{ color: value ? '#111827' : '#9CA3AF' }}>
              {displayValue || 'Selecione a data'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={show}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date: Date) => {
          // Normaliza para início do dia antes de formatar
          const normalized = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          setShow(false);
          onChange(format(normalized, 'yyyy-MM-dd'));
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
