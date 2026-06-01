import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
  soft: '#12213a',
  primary: '#00d4a6',
  blue: '#4c8dff',
  orange: '#ffb84d',
  red: '#ff6b6b',
  text: '#f3f7ff',
  muted: '#91a1bb',
  border: '#203754',
};

const STORAGE_WEIGHT_KEY = '@fittrack:body-weight';
const STORAGE_PROFILE_KEY = '@fittrack:profile';
const WORKOUT_HISTORY_KEY = '@fittrack:workout-history';

type WeightRecord = {
  value: number;
  date: string;
};

type ProfileData = {
  name: string;
  age: string;
  height: string;
  goalWeight: string;
};

type WorkoutSession = {
  id: string;
  title: string;
  date: string;
  totalVolume: number;
};

const DEFAULT_PROFILE: ProfileData = {
  name: '',
  age: '',
  height: '',
  goalWeight: '',
};

function parseNumber(value: string) {
  return Number(value.replace(',', '.'));
}

function formatNumber(value: number) {
  return value.toFixed(1).replace('.', ',');
}

function getBmiStatus(bmi: number) {
  if (bmi < 18.5) return { label: 'Abaixo', color: COLORS.blue };
  if (bmi < 25) return { label: 'Normal', color: COLORS.primary };
  if (bmi < 30) return { label: 'Sobrepeso', color: COLORS.orange };
  return { label: 'Alto', color: COLORS.red };
}

export default function HomeScreen() {
  const router = useRouter();

  const [weightInput, setWeightInput] = useState('');
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [weightData, profileData, workoutData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_WEIGHT_KEY),
        AsyncStorage.getItem(STORAGE_PROFILE_KEY),
        AsyncStorage.getItem(WORKOUT_HISTORY_KEY),
      ]);

      setWeights(weightData ? JSON.parse(weightData) : []);
      setProfile(
        profileData
          ? { ...DEFAULT_PROFILE, ...JSON.parse(profileData) }
          : DEFAULT_PROFILE
      );
      setWorkouts(workoutData ? JSON.parse(workoutData) : []);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel carregar os dados.');
    }
  }

  async function saveWeight() {
    const value = parseNumber(weightInput);

    if (!value || value <= 0) {
      Alert.alert('Peso invalido', 'Digite um peso valido. Exemplo: 103.5');
      return;
    }

    const newRecord: WeightRecord = {
      value,
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const newHistory = [newRecord, ...weights].slice(0, 40);

    try {
      await AsyncStorage.setItem(STORAGE_WEIGHT_KEY, JSON.stringify(newHistory));
      setWeights(newHistory);
      setWeightInput('');
      Alert.alert('Peso salvo', `Peso de ${formatNumber(value)} kg registrado.`);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar o peso.');
    }
  }

  const currentWeight = weights[0]?.value ?? 0;
  const previousWeight = weights[1]?.value ?? 0;
  const height = parseNumber(profile.height || '0');
  const goalWeight = parseNumber(profile.goalWeight || '0');

  const bmi = currentWeight && height ? currentWeight / (height * height) : 0;
  const bmiStatus = bmi ? getBmiStatus(bmi) : null;

  const weightChange =
    currentWeight && previousWeight ? currentWeight - previousWeight : 0;

  const goalDistance =
    currentWeight && goalWeight ? currentWeight - goalWeight : 0;

  const totalVolume = workouts.reduce((acc, item) => acc + item.totalVolume, 0);
  const lastWorkout = workouts[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>FitTrack Pro</Text>

            <Text style={styles.title}>
              {profile.name ? `Ola, ${profile.name}` : 'Bem-vindo'}
            </Text>

            <Text style={styles.subtitle}>
              Registre seu peso, crie treinos, anote series e acompanhe sua evolucao.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.8}
            onPress={() => router.push('/profile' as any)}
          >
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Peso corporal atual</Text>

              <Text style={styles.bigValue}>
                {currentWeight ? `${formatNumber(currentWeight)} kg` : '--'}
              </Text>

              <Text style={styles.cardText}>
                {previousWeight
                  ? `Mudanca: ${weightChange > 0 ? '+' : ''}${formatNumber(
                      weightChange
                    )} kg`
                  : 'Digite seu peso atual para iniciar o acompanhamento.'}
              </Text>
            </View>

            <View style={styles.bigIcon}>
              <Ionicons name="scale-outline" size={32} color={COLORS.primary} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder="Ex: 103.5"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={saveWeight}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Ionicons
              name="body-outline"
              size={24}
              color={bmiStatus?.color ?? COLORS.muted}
            />
            <Text style={styles.metricValue}>{bmi ? formatNumber(bmi) : '--'}</Text>
            <Text style={styles.metricTitle}>IMC</Text>
            <Text style={[styles.metricDesc, { color: bmiStatus?.color ?? COLORS.muted }]}>
              {bmiStatus?.label ?? 'Sem dados'}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trophy-outline" size={24} color={COLORS.orange} />
            <Text style={styles.metricValue}>
              {currentWeight && goalWeight
                ? `${goalDistance > 0 ? '+' : ''}${formatNumber(goalDistance)} kg`
                : '--'}
            </Text>
            <Text style={styles.metricTitle}>Meta</Text>
            <Text style={styles.metricDesc}>distancia</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="barbell-outline" size={24} color={COLORS.blue} />
            <Text style={styles.metricValue}>
              {totalVolume ? `${Math.round(totalVolume)} kg` : '--'}
            </Text>
            <Text style={styles.metricTitle}>Volume</Text>
            <Text style={styles.metricDesc}>total salvo</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="fitness-outline" size={24} color={COLORS.primary} />
            <Text style={styles.metricValue}>
              {lastWorkout ? `${Math.round(lastWorkout.totalVolume)} kg` : '--'}
            </Text>
            <Text style={styles.metricTitle}>Ultimo treino</Text>
            <Text style={styles.metricDesc}>volume</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.push('/explore' as any)}
          >
            <Ionicons name="barbell-outline" size={22} color={COLORS.primary} />
            <Text style={styles.actionText}>Treinos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.push('/create-workout' as any)}
          >
            <Ionicons name="add-circle-outline" size={22} color={COLORS.blue} />
            <Text style={styles.actionText}>Criar treino</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.push('/progress' as any)}
          >
            <Ionicons name="analytics-outline" size={22} color={COLORS.orange} />
            <Text style={styles.actionText}>Graficos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.sectionTitle}>Resumo</Text>

          <Text style={styles.cardText}>
            {workouts.length > 0
              ? `Voce possui ${workouts.length} treinos salvos e ${Math.round(
                  totalVolume
                )} kg de volume acumulado.`
              : 'Crie ou abra um treino, registre carga e repeticoes por serie e salve para ver os graficos.'}
          </Text>
        </View>
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
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 310,
    marginTop: 6,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  bigValue: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },
  cardText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  bigIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#00d4a620',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.soft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  saveButton: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#06111f',
    fontWeight: '900',
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  metricTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  metricDesc: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
});