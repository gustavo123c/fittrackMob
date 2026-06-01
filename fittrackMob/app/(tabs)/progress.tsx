import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { DimensionValue } from 'react-native';
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
  if (bmi < 18.5) return { label: 'Abaixo do peso', color: COLORS.blue };
  if (bmi < 25) return { label: 'Peso normal', color: COLORS.primary };
  if (bmi < 30) return { label: 'Sobrepeso', color: COLORS.orange };
  return { label: 'IMC alto', color: COLORS.red };
}

export default function ProgressScreen() {
  const router = useRouter();

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
      setProfile(profileData ? { ...DEFAULT_PROFILE, ...JSON.parse(profileData) } : DEFAULT_PROFILE);
      setWorkouts(workoutData ? JSON.parse(workoutData) : []);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o progresso.');
    }
  }

  const currentWeight = weights[0]?.value ?? 0;
  const previousWeight = weights[1]?.value ?? 0;
  const height = parseNumber(profile.height || '0');
  const goalWeight = parseNumber(profile.goalWeight || '0');

  const bmi = currentWeight && height ? currentWeight / (height * height) : 0;
  const bmiStatus = bmi ? getBmiStatus(bmi) : null;

  const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : 0;
  const goalDistance = currentWeight && goalWeight ? currentWeight - goalWeight : 0;

  const totalVolume = workouts.reduce((acc, item) => acc + item.totalVolume, 0);
  const lastVolume = workouts[0]?.totalVolume ?? 0;

  const bestWorkout = useMemo(() => {
    if (workouts.length === 0) return null;
    return workouts.reduce((best, item) =>
      item.totalVolume > best.totalVolume ? item : best
    );
  }, [workouts]);

  const weightChart = [...weights].slice(0, 7).reverse();
  const workoutChart = [...workouts].slice(0, 7).reverse();

  const maxWeight = Math.max(...weightChart.map((item) => item.value), 1);
  const maxVolume = Math.max(...workoutChart.map((item) => item.totalVolume), 1);

  function barWidth(value: number, max: number) {
    return `${Math.max((value / max) * 100, 8)}%` as DimensionValue;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Gráficos</Text>
            <Text style={styles.title}>Progresso</Text>
            <Text style={styles.subtitle}>
              Veja a melhora do peso corporal e das cargas dos treinos.
            </Text>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={loadData}>
            <Ionicons name="refresh-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>IMC atual</Text>
              <Text style={styles.bigValue}>{bmi ? formatNumber(bmi) : '--'}</Text>
            </View>

            <View style={[styles.badge, { borderColor: bmiStatus?.color ?? COLORS.border }]}>
              <Text style={[styles.badgeText, { color: bmiStatus?.color ?? COLORS.muted }]}>
                {bmiStatus?.label ?? 'Sem dados'}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoMini}>
              <Text style={styles.infoLabel}>Peso</Text>
              <Text style={styles.infoValue}>
                {currentWeight ? `${formatNumber(currentWeight)} kg` : '--'}
              </Text>
            </View>

            <View style={styles.infoMini}>
              <Text style={styles.infoLabel}>Meta</Text>
              <Text style={styles.infoValue}>
                {goalWeight ? `${formatNumber(goalWeight)} kg` : '--'}
              </Text>
            </View>

            <View style={styles.infoMini}>
              <Text style={styles.infoLabel}>Mudança</Text>
              <Text style={styles.infoValue}>
                {previousWeight
                  ? `${weightChange > 0 ? '+' : ''}${formatNumber(weightChange)} kg`
                  : '--'}
              </Text>
            </View>

            <View style={styles.infoMini}>
              <Text style={styles.infoLabel}>Distância</Text>
              <Text style={styles.infoValue}>
                {currentWeight && goalWeight
                  ? `${goalDistance > 0 ? '+' : ''}${formatNumber(goalDistance)} kg`
                  : '--'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/profile' as any)}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Ionicons name="barbell-outline" size={22} color={COLORS.blue} />
            <Text style={styles.metricValue}>
              {lastVolume ? `${Math.round(lastVolume)} kg` : '--'}
            </Text>
            <Text style={styles.metricTitle}>Último treino</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trending-up-outline" size={22} color={COLORS.primary} />
            <Text style={styles.metricValue}>
              {totalVolume ? `${Math.round(totalVolume)} kg` : '--'}
            </Text>
            <Text style={styles.metricTitle}>Volume total</Text>
          </View>
        </View>

        <View style={styles.bestCard}>
          <Ionicons name="trophy-outline" size={26} color={COLORS.orange} />

          <View style={{ flex: 1 }}>
            <Text style={styles.bestTitle}>Melhor treino</Text>
            <Text style={styles.bestText}>
              {bestWorkout
                ? `${bestWorkout.title} com ${Math.round(bestWorkout.totalVolume)} kg de volume.`
                : 'Salve um treino para aparecer aqui.'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gráfico do peso corporal</Text>

        <View style={styles.chartCard}>
          {weightChart.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum peso registrado. Vá para Início e salve seu peso atual.
            </Text>
          ) : (
            weightChart.map((item, index) => (
              <View key={`${item.date}-${index}`} style={styles.barItem}>
                <View style={styles.barTop}>
                  <Text style={styles.barLabel}>{item.date}</Text>
                  <Text style={styles.barValue}>{formatNumber(item.value)} kg</Text>
                </View>

                <View style={styles.barBackground}>
                  <View style={[styles.weightBar, { width: barWidth(item.value, maxWeight) }]} />
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Gráfico das cargas dos treinos</Text>

        <View style={styles.chartCard}>
          {workoutChart.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum treino salvo. Abra um treino, registre as séries e salve.
            </Text>
          ) : (
            workoutChart.map((item) => (
              <View key={item.id} style={styles.barItem}>
                <View style={styles.barTop}>
                  <Text style={styles.barLabel}>{item.title}</Text>
                  <Text style={styles.barValue}>{Math.round(item.totalVolume)} kg</Text>
                </View>

                <View style={styles.barBackground}>
                  <View style={[styles.volumeBar, { width: barWidth(item.totalVolume, maxVolume) }]} />
                </View>

                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            O gráfico de cargas usa o volume do treino: soma de carga x repetições em todas as séries.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
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
  card: {
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
  label: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  bigValue: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: '900',
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  infoMini: {
    width: '48%',
    backgroundColor: COLORS.soft,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: '900',
    marginTop: 8,
  },
  metricTitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  bestCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  bestTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  bestText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
  },
  barItem: {
    marginBottom: 16,
  },
  barTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 7,
  },
  barLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
    flex: 1,
  },
  barValue: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  barBackground: {
    height: 13,
    borderRadius: 999,
    backgroundColor: '#243955',
    overflow: 'hidden',
  },
  weightBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  volumeBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.blue,
  },
  dateText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.soft,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
});