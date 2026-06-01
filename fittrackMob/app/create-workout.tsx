import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#07111f',
  card: '#0d1b31',
  soft: '#12213a',
  primary: '#00d4a6',
  text: '#f3f7ff',
  muted: '#91a1bb',
  border: '#203754',
};

const CUSTOM_WORKOUTS_KEY = '@fittrack:custom-workouts';

type WorkoutPlan = {
  id: string;
  title: string;
  level: string;
  time: string;
  exercises: string[];
  custom: boolean;
};

export default function CreateWorkoutScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Intermediario');
  const [time, setTime] = useState('60 min');
  const [exerciseText, setExerciseText] = useState('');

  async function saveWorkout() {
    const exercises = exerciseText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!title.trim()) {
      Alert.alert('Nome invalido', 'Digite o nome do treino.');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Exercicios invalidos', 'Digite pelo menos um exercicio.');
      return;
    }

    const newWorkout: WorkoutPlan = {
      id: String(Date.now()),
      title: title.trim(),
      level: level.trim() || 'Intermediario',
      time: time.trim() || '60 min',
      exercises,
      custom: true,
    };

    try {
      const data = await AsyncStorage.getItem(CUSTOM_WORKOUTS_KEY);
      const current: WorkoutPlan[] = data ? JSON.parse(data) : [];
      const updated = [newWorkout, ...current];

      await AsyncStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(updated));

      Alert.alert('Treino criado', 'Seu treino personalizado foi salvo.');
      router.replace('/explore' as any);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o treino.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.replace('/explore' as any)}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Novo treino</Text>
            <Text style={styles.title}>Criar treino</Text>
            <Text style={styles.subtitle}>
              Monte um treino personalizado e depois abra ele na aba Treinos.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nome do treino</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Peito pesado"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.label}>Nivel</Text>
            <TextInput
              value={level}
              onChangeText={setLevel}
              placeholder="Ex: Intermediario"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.label}>Tempo estimado</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="Ex: 60 min"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.label}>Exercicios</Text>
            <Text style={styles.help}>Digite um exercicio por linha.</Text>

            <TextInput
              value={exerciseText}
              onChangeText={setExerciseText}
              placeholder={'Supino reto\nSupino inclinado\nCrucifixo\nTriceps corda'}
              placeholderTextColor={COLORS.muted}
              multiline
              textAlignVertical="top"
              style={styles.textArea}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.86}
              onPress={saveWorkout}
            >
              <Ionicons name="save-outline" size={18} color="#06111f" />
              <Text style={styles.primaryButtonText}>Salvar treino</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.86}
              onPress={() => router.replace('/explore' as any)}
            >
              <Ionicons name="barbell-outline" size={18} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Ir para treinos</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: COLORS.background,
  },
  backButton: {
    alignSelf: 'flex-start',
    height: 44,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    color: COLORS.text,
    fontWeight: '900',
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 7,
  },
  help: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 7,
  },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.soft,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 160,
    borderRadius: 16,
    backgroundColor: COLORS.soft,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingTop: 14,
    fontSize: 15,
  },
  primaryButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#06111f',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
});