import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const COLORS = {
  background: '#07111f',
  card: '#0d1b31',
  cardSoft: '#12213a',
  primary: '#00d4a6',
  blue: '#4c8dff',
  orange: '#ffb84d',
  red: '#ff6b6b',
  text: '#f3f7ff',
  muted: '#91a1bb',
  border: '#203754',
};

type WeightRecord = {
  value: number;
  date: string;
};

const STORAGE_WEIGHT_KEY = '@fittrack:body-weight';

const summary = [
  {
    label: 'Treinos',
    value: '12',
    detail: 'este mes',
    icon: 'barbell-outline' as IconName,
    color: COLORS.primary,
  },
  {
    label: 'Carga',
    value: '8.4t',
    detail: 'volume total',
    icon: 'trending-up-outline' as IconName,
    color: COLORS.blue,
  },
  {
    label: 'Sequencia',
    value: '5',
    detail: 'dias ativos',
    icon: 'flame-outline' as IconName,
    color: COLORS.orange,
  },
  {
    label: 'Meta',
    value: '82%',
    detail: 'concluida',
    icon: 'trophy-outline' as IconName,
    color: COLORS.red,
  },
];

const recentWorkouts = [
  {
    name: 'Peito, Ombro e Triceps',
    date: 'Hoje',
    exercises: ['Supino reto', 'Supino inclinado', 'Desenvolvimento', 'Triceps corda'],
    time: '58 min',
  },
  {
    name: 'Costas e Biceps',
    date: 'Ontem',
    exercises: ['Puxada alta', 'Remada curvada', 'Remada baixa', 'Rosca direta'],
    time: '1h 05min',
  },
  {
    name: 'Pernas Completo',
    date: 'Segunda',
    exercises: ['Agachamento', 'Leg press', 'Cadeira extensora', 'Mesa flexora'],
    time: '1h 12min',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const [bodyWeight, setBodyWeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);

  useEffect(() => {
    carregarPesos();
  }, []);

  async function carregarPesos() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_WEIGHT_KEY);

      if (data) {
        setWeightHistory(JSON.parse(data));
      }
    } catch {
      Alert.alert('Erro', 'Nao foi possivel carregar seu historico de peso.');
    }
  }

  async function salvarPesoCorporal() {
    const value = Number(bodyWeight.replace(',', '.'));

    if (!value || value <= 0) {
      Alert.alert('Peso invalido', 'Digite um peso valido. Exemplo: 103.5');
      return;
    }

    const novoRegistro: WeightRecord = {
      value,
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const novoHistorico = [novoRegistro, ...weightHistory].slice(0, 5);

    try {
      await AsyncStorage.setItem(STORAGE_WEIGHT_KEY, JSON.stringify(novoHistorico));
      setWeightHistory(novoHistorico);
      setBodyWeight('');
      Alert.alert('Peso salvo', `Seu peso de ${value} kg foi registrado.`);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel salvar seu peso.');
    }
  }

  function abrirTreino(workout: (typeof recentWorkouts)[0]) {
    router.push({
      pathname: '/modal',
      params: {
        title: workout.name,
        time: workout.time,
        exercises: workout.exercises.join(','),
      },
    } as any);
  }

  const ultimoPeso = weightHistory.length > 0 ? `${weightHistory[0].value} kg` : '--';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>FitTrack Pro</Text>
            <Text style={styles.title}>Seu progresso</Text>
            <Text style={styles.subtitle}>
              Registre seu peso, treinos, cargas e acompanhe sua evolucao.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.profileButton}
            onPress={() => Alert.alert('Perfil', `Ultimo peso registrado: ${ultimoPeso}`)}
          >
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Peso corporal</Text>
              <Text style={styles.heroTitle}>{ultimoPeso}</Text>
              <Text style={styles.heroText}>
                Digite seu peso atual para acompanhar sua evolucao.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="scale-outline" size={32} color={COLORS.primary} />
            </View>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={bodyWeight}
              onChangeText={setBodyWeight}
              placeholder="Ex: 103.5"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.saveSmallButton}
              onPress={salvarPesoCorporal}
            >
              <Text style={styles.saveSmallButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          {weightHistory.length > 0 && (
            <View style={styles.historyBox}>
              <Text style={styles.historyTitle}>Historico recente</Text>

              {weightHistory.map((item, index) => (
                <View key={`${item.date}-${index}`} style={styles.historyItem}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyValue}>{item.value} kg</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.quickButton}
            onPress={() => abrirTreino(recentWorkouts[0])}
          >
            <Ionicons name="play-outline" size={22} color={COLORS.primary} />
            <Text style={styles.quickText}>Iniciar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.quickButton}
            onPress={() => router.push('/explore' as any)}
          >
            <Ionicons name="barbell-outline" size={22} color={COLORS.blue} />
            <Text style={styles.quickText}>Treinos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.quickButton}
            onPress={() => Alert.alert('Progresso', `Peso atual: ${ultimoPeso}`)}
          >
            <Ionicons name="analytics-outline" size={22} color={COLORS.orange} />
            <Text style={styles.quickText}>Progresso</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {summary.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>

              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricDetail}>{item.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Treinos recentes</Text>

          <TouchableOpacity onPress={() => router.push('/explore' as any)}>
            <Text style={styles.sectionAction}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {recentWorkouts.map((workout) => (
          <TouchableOpacity
            activeOpacity={0.82}
            key={workout.name}
            style={styles.workoutCard}
            onPress={() => abrirTreino(workout)}
          >
            <View style={styles.workoutIcon}>
              <Ionicons name="fitness-outline" size={22} color={COLORS.primary} />
            </View>

            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDetails}>
                {workout.exercises.length} exercicios • {workout.time}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.workoutDate}>{workout.date}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.progressCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Evolucao semanal</Text>
            <Ionicons name="trending-up" size={22} color={COLORS.primary} />
          </View>

          <Text style={styles.progressText}>
            Voce treinou 5 de 6 dias planejados.
          </Text>

          <View style={styles.progressBarBackground}>
            <View style={styles.progressBarFill} />
          </View>

          <Text style={styles.progressPercent}>82% da meta concluida</Text>
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
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 21,
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 20,
  },
  heroLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  heroText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  saveSmallButton: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveSmallButtonText: {
    color: '#06111f',
    fontWeight: '900',
    fontSize: 15,
  },
  historyBox: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  historyDate: {
    color: COLORS.muted,
    fontSize: 13,
  },
  historyValue: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 7,
  },
  quickText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
  },
  metricLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  metricDetail: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '900',
  },
  sectionAction: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  workoutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 15,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  workoutDetails: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  workoutDate: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  progressCard: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 24,
    padding: 18,
    marginTop: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 6,
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#243955',
    marginTop: 18,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '82%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  progressPercent: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
});