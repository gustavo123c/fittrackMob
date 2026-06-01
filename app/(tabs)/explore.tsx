import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#07111f',
  card: '#0d1b31',
  soft: '#12213a',
  primary: '#00d4a6',
  orange: '#ffb84d',
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
  custom?: boolean;
};

const DEFAULT_WORKOUTS: WorkoutPlan[] = [
  {
    id: 'default-1',
    title: 'Peito, Ombro e Triceps',
    level: 'Intermediário',
    time: '58 min',
    exercises: ['Supino reto', 'Supino inclinado', 'Desenvolvimento', 'Tríceps corda'],
  },
  {
    id: 'default-2',
    title: 'Costas e Biceps',
    level: 'Intermediário',
    time: '1h 05min',
    exercises: ['Puxada alta', 'Remada baixa', 'Remada curvada', 'Rosca direta'],
  },
  {
    id: 'default-3',
    title: 'Pernas Completo',
    level: 'Avançado',
    time: '1h 15min',
    exercises: ['Agachamento', 'Leg press', 'Cadeira extensora', 'Mesa flexora'],
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [customWorkouts, setCustomWorkouts] = useState<WorkoutPlan[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  async function loadWorkouts() {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_WORKOUTS_KEY);
      setCustomWorkouts(data ? JSON.parse(data) : []);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar seus treinos.');
    }
  }

  async function deleteCustomWorkout(id: string) {
    Alert.alert('Apagar treino', 'Deseja apagar este treino personalizado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = customWorkouts.filter((item) => item.id !== id);
            await AsyncStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(updated));
            setCustomWorkouts(updated);
          } catch {
            Alert.alert('Erro', 'Não foi possível apagar o treino.');
          }
        },
      },
    ]);
  }

  function openWorkout(workout: WorkoutPlan) {
    router.push({
      pathname: '/modal',
      params: {
        title: workout.title,
        level: workout.level,
        time: workout.time,
        exercises: workout.exercises.join(','),
      },
    } as any);
  }

  const workouts = [...customWorkouts, ...DEFAULT_WORKOUTS];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Biblioteca</Text>
            <Text style={styles.title}>Treinos</Text>
            <Text style={styles.subtitle}>
              Escolha um treino pronto ou crie um treino personalizado.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={() => router.push('/create-workout' as any)}
          >
            <Ionicons name="add" size={26} color="#06111f" />
          </TouchableOpacity>
        </View>

        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            activeOpacity={0.86}
            style={styles.card}
            onPress={() => openWorkout(workout)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Ionicons name="barbell-outline" size={24} color={COLORS.primary} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.workoutMeta}>
                  {workout.level} • {workout.time} • {workout.exercises.length} exercícios
                </Text>
              </View>

              {workout.custom ? (
                <TouchableOpacity
                  onPress={() => deleteCustomWorkout(workout.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.orange} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
              )}
            </View>

            <View style={styles.exerciseList}>
              {workout.exercises.map((exercise, index) => (
                <View key={`${exercise}-${index}`} style={styles.exerciseItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.exerciseText}>{exercise}</Text>
                </View>
              ))}
            </View>

            <View style={styles.startButton}>
              <Ionicons name="play-outline" size={18} color={COLORS.primary} />
              <Text style={styles.startButtonText}>Abrir treino</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
    maxWidth: 300,
    marginTop: 6,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#00d4a620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  workoutMeta: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseList: {
    marginTop: 16,
    gap: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  startButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
});