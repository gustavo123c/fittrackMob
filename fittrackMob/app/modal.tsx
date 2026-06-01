import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  blue: '#4c8dff',
  orange: '#ffb84d',
  text: '#f3f7ff',
  muted: '#91a1bb',
  border: '#203754',
};

const WORKOUT_HISTORY_KEY = '@fittrack:workout-history';

type SetLog = {
  carga: string;
  repeticoes: string;
};

type ExerciseLog = {
  sets: SetLog[];
};

type WorkoutLogs = Record<string, ExerciseLog>;

type WorkoutSession = {
  id: string;
  title: string;
  date: string;
  totalVolume: number;
  logs: WorkoutLogs;
};

const DEFAULT_SETS: SetLog[] = [
  { carga: '', repeticoes: '' },
  { carga: '', repeticoes: '' },
  { carga: '', repeticoes: '' },
];

function parseNumber(value: string) {
  return Number(value.replace(',', '.'));
}

function createDefaultSets() {
  return DEFAULT_SETS.map((item) => ({ ...item }));
}

export default function ModalScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    title?: string;
    time?: string;
    level?: string;
    exercises?: string;
  }>();

  const title = params.title ?? 'Treino';
  const time = params.time ?? '60 min';
  const level = params.level ?? 'Intermediario';

  const exercises = params.exercises
    ? params.exercises.split(',').map((item) => item.trim()).filter(Boolean)
    : ['Supino reto', 'Supino inclinado', 'Desenvolvimento'];

  const storageKey = `@fittrack:workout:${title}`;

  const [logs, setLogs] = useState<WorkoutLogs>({});

  useEffect(() => {
    loadWorkout();
  }, [title]);

  async function loadWorkout() {
    try {
      const data = await AsyncStorage.getItem(storageKey);

      if (data) {
        const parsed = JSON.parse(data);
        setLogs(parsed);
      } else {
        setLogs({});
      }
    } catch {
      Alert.alert('Erro', 'Nao foi possivel carregar o treino.');
    }
  }

  function getSets(exercise: string) {
    return logs[exercise]?.sets ?? createDefaultSets();
  }

  function updateSet(
    exercise: string,
    setIndex: number,
    field: 'carga' | 'repeticoes',
    value: string
  ) {
    setLogs((current) => {
      const currentSets = current[exercise]?.sets ?? createDefaultSets();
      const newSets = currentSets.map((set, index) => {
        if (index !== setIndex) return set;
        return { ...set, [field]: value };
      });

      return {
        ...current,
        [exercise]: {
          sets: newSets,
        },
      };
    });
  }

  function addSet(exercise: string) {
    setLogs((current) => {
      const currentSets = current[exercise]?.sets ?? createDefaultSets();

      return {
        ...current,
        [exercise]: {
          sets: [...currentSets, { carga: '', repeticoes: '' }],
        },
      };
    });
  }

  function removeSet(exercise: string, setIndex: number) {
    setLogs((current) => {
      const currentSets = current[exercise]?.sets ?? createDefaultSets();

      if (currentSets.length <= 1) {
        return current;
      }

      return {
        ...current,
        [exercise]: {
          sets: currentSets.filter((_, index) => index !== setIndex),
        },
      };
    });
  }

  function calcSetVolume(set: SetLog) {
    const carga = parseNumber(set.carga || '0');
    const reps = parseNumber(set.repeticoes || '0');

    if (!carga || !reps) return 0;

    return carga * reps;
  }

  function calcExerciseVolume(exercise: string) {
    return getSets(exercise).reduce((acc, set) => acc + calcSetVolume(set), 0);
  }

  function calcTotalVolume() {
    return exercises.reduce((acc, exercise) => acc + calcExerciseVolume(exercise), 0);
  }

  async function saveWorkout() {
    const totalVolume = calcTotalVolume();

    if (totalVolume <= 0) {
      Alert.alert(
        'Treino vazio',
        'Digite carga e repeticoes em pelo menos uma serie antes de salvar.'
      );
      return;
    }

    const completeLogs: WorkoutLogs = {};

    exercises.forEach((exercise) => {
      completeLogs[exercise] = {
        sets: getSets(exercise),
      };
    });

    const newSession: WorkoutSession = {
      id: String(Date.now()),
      title,
      date: new Date().toLocaleDateString('pt-BR'),
      totalVolume,
      logs: completeLogs,
    };

    try {
      const historyData = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
      const currentHistory: WorkoutSession[] = historyData ? JSON.parse(historyData) : [];
      const newHistory = [newSession, ...currentHistory].slice(0, 50);

      await AsyncStorage.setItem(storageKey, JSON.stringify(completeLogs));
      await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(newHistory));

      setLogs(completeLogs);

      Alert.alert(
        'Treino salvo',
        `Volume total registrado: ${Math.round(totalVolume)} kg.`
      );
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o treino.');
    }
  }

  async function clearWorkout() {
    try {
      await AsyncStorage.removeItem(storageKey);
      setLogs({});
      Alert.alert('Limpo', 'As anotacoes desse treino foram apagadas.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel limpar o treino.');
    }
  }

  const totalVolume = calcTotalVolume();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Treino</Text>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <Ionicons name="time-outline" size={17} color={COLORS.primary} />
                <Text style={styles.metaText}>{time}</Text>
              </View>

              <View style={styles.metaBox}>
                <Ionicons name="speedometer-outline" size={17} color={COLORS.orange} />
                <Text style={styles.metaText}>{level}</Text>
              </View>
            </View>

            <View style={styles.volumeBox}>
              <Text style={styles.volumeLabel}>Volume total</Text>
              <Text style={styles.volumeValue}>{Math.round(totalVolume)} kg</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Series do treino</Text>

          {exercises.map((exercise, exerciseIndex) => {
            const sets = getSets(exercise);
            const exerciseVolume = calcExerciseVolume(exercise);

            return (
              <View key={`${exercise}-${exerciseIndex}`} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{exercise}</Text>
                    <Text style={styles.exerciseInfo}>
                      Volume: {Math.round(exerciseVolume)} kg
                    </Text>
                  </View>
                </View>

                {sets.map((set, setIndex) => {
                  const setVolume = calcSetVolume(set);

                  return (
                    <View key={`${exercise}-${setIndex}`} style={styles.setCard}>
                      <Text style={styles.setTitle}>Serie {setIndex + 1}</Text>

                      <View style={styles.inputsRow}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Carga kg</Text>
                          <TextInput
                            value={set.carga}
                            onChangeText={(value) =>
                              updateSet(exercise, setIndex, 'carga', value)
                            }
                            placeholder="40"
                            placeholderTextColor={COLORS.muted}
                            keyboardType="decimal-pad"
                            style={styles.input}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Reps</Text>
                          <TextInput
                            value={set.repeticoes}
                            onChangeText={(value) =>
                              updateSet(exercise, setIndex, 'repeticoes', value)
                            }
                            placeholder="12"
                            placeholderTextColor={COLORS.muted}
                            keyboardType="number-pad"
                            style={styles.input}
                          />
                        </View>

                        <View style={styles.setVolumeBox}>
                          <Text style={styles.inputLabel}>Volume</Text>
                          <Text style={styles.setVolumeText}>
                            {Math.round(setVolume)}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeSet(exercise, setIndex)}
                        >
                          <Ionicons name="remove" size={18} color={COLORS.orange} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exercise)}>
                  <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.addSetText}>Adicionar serie</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Agora cada serie tem sua propria carga e repeticoes. O volume e a soma de carga x repeticoes de todas as series.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={saveWorkout}>
            <Ionicons name="save-outline" size={18} color="#06111f" />
            <Text style={styles.primaryButtonText}>Salvar treino</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/progress' as any)}>
            <Ionicons name="analytics-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Ver graficos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={clearWorkout}>
            <Ionicons name="trash-outline" size={18} color={COLORS.orange} />
            <Text style={styles.dangerButtonText}>Limpar anotacoes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 60 },
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
    marginBottom: 18,
  },
  backText: { color: COLORS.text, fontWeight: '900' },
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  metaBox: {
    backgroundColor: COLORS.soft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaText: { color: COLORS.text, fontWeight: '800', fontSize: 13 },
  volumeBox: {
    backgroundColor: COLORS.soft,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 16,
  },
  volumeLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '900' },
  volumeValue: { color: COLORS.primary, fontSize: 30, fontWeight: '900', marginTop: 4 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 14,
  },
  exerciseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  exerciseNumber: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#00d4a620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: { color: COLORS.primary, fontWeight: '900' },
  exerciseName: { color: COLORS.text, fontSize: 16, fontWeight: '900' },
  exerciseInfo: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  setCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  setTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputGroup: { flex: 1 },
  inputLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 5,
  },
  input: {
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  setVolumeBox: {
    width: 58,
  },
  setVolumeText: {
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.blue,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 12,
  },
  removeButton: {
    width: 36,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButton: {
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 4,
  },
  addSetText: { color: COLORS.primary, fontWeight: '900' },
  infoCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  primaryButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
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
  dangerButton: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dangerButtonText: {
    color: COLORS.orange,
    fontSize: 15,
    fontWeight: '900',
  },
});