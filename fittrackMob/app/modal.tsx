import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  cardSoft: '#12213a',
  primary: '#00d4a6',
  text: '#f3f7ff',
  muted: '#91a1bb',
  border: '#203754',
  orange: '#ffb84d',
};

type ExerciseLog = {
  carga: string;
  repeticoes: string;
};

type WorkoutLogs = Record<string, ExerciseLog>;

export default function ModalScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    title?: string;
    time?: string;
    level?: string;
    exercises?: string;
  }>();

  const title = params.title ?? 'Treino';
  const time = params.time ?? '50 min';
  const level = params.level ?? 'Intermediario';

  const exercises = params.exercises
    ? params.exercises.split(',').map((item) => item.trim())
    : ['Supino reto', 'Supino inclinado', 'Desenvolvimento', 'Triceps corda'];

  const storageKey = `@fittrack:workout:${title}`;

  const [logs, setLogs] = useState<WorkoutLogs>({});

  useEffect(() => {
    carregarTreino();
  }, []);

  async function carregarTreino() {
    try {
      const data = await AsyncStorage.getItem(storageKey);

      if (data) {
        setLogs(JSON.parse(data));
      }
    } catch {
      Alert.alert('Erro', 'Nao foi possivel carregar as cargas desse treino.');
    }
  }

  function atualizarExercicio(
    exercise: string,
    field: 'carga' | 'repeticoes',
    value: string
  ) {
    setLogs((current) => ({
      ...current,
      [exercise]: {
        carga: current[exercise]?.carga ?? '',
        repeticoes: current[exercise]?.repeticoes ?? '',
        [field]: value,
      },
    }));
  }

  async function salvarTreino() {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(logs));
      Alert.alert('Treino salvo', 'Suas cargas e repeticoes foram registradas.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o treino.');
    }
  }

  async function limparTreino() {
    try {
      await AsyncStorage.removeItem(storageKey);
      setLogs({});
      Alert.alert('Limpo', 'As anotacoes desse treino foram apagadas.');
    } catch {
      Alert.alert('Erro', 'Nao foi possivel limpar esse treino.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="barbell-outline" size={34} color={COLORS.primary} />
          </View>

          <Text style={styles.eyebrow}>Treino selecionado</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Ionicons name="time-outline" size={18} color={COLORS.primary} />
              <Text style={styles.metaText}>{time}</Text>
            </View>

            <View style={styles.metaBox}>
              <Ionicons name="speedometer-outline" size={18} color={COLORS.orange} />
              <Text style={styles.metaText}>{level}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Anotar cargas</Text>

        {exercises.map((exercise, index) => (
          <View key={`${exercise}-${index}`} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{exercise}</Text>
                <Text style={styles.exerciseDetail}>
                  Registre a carga usada e as repeticoes
                </Text>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Carga kg</Text>
                <TextInput
                  value={logs[exercise]?.carga ?? ''}
                  onChangeText={(value) => atualizarExercicio(exercise, 'carga', value)}
                  placeholder="Ex: 40"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Repeticoes</Text>
                <TextInput
                  value={logs[exercise]?.repeticoes ?? ''}
                  onChangeText={(value) =>
                    atualizarExercicio(exercise, 'repeticoes', value)
                  }
                  placeholder="Ex: 12"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />

          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Dica</Text>
            <Text style={styles.infoText}>
              Na proxima vez que abrir esse treino, suas cargas vao aparecer salvas.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.primaryButton}
          onPress={salvarTreino}
        >
          <Ionicons name="save-outline" size={18} color="#06111f" />
          <Text style={styles.primaryButtonText}>Salvar treino</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.dangerButton}
          onPress={limparTreino}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.orange} />
          <Text style={styles.dangerButtonText}>Limpar anotacoes</Text>
        </TouchableOpacity>
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
    paddingBottom: 42,
  },
  backButton: {
    alignSelf: 'flex-start',
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  backText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
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
    fontSize: 29,
    fontWeight: '900',
    marginTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  metaBox: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 13,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 14,
  },
  exerciseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
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
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 15,
  },
  exerciseName: {
    color: COLORS.text,
    fontWeight: '900',
    fontSize: 15,
  },
  exerciseDetail: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 13,
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 18,
  },
  infoTitle: {
    color: COLORS.text,
    fontWeight: '900',
    fontSize: 15,
  },
  infoText: {
    color: COLORS.muted,
    lineHeight: 20,
    marginTop: 4,
    fontSize: 13,
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