import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

const summary = [
  {
    label: 'Treinos',
    value: '12',
    detail: 'este mes',
    icon: 'barbell-outline',
    color: COLORS.primary,
  },
  {
    label: 'Carga',
    value: '8.4t',
    detail: 'volume total',
    icon: 'trending-up-outline',
    color: COLORS.blue,
  },
  {
    label: 'Sequencia',
    value: '5',
    detail: 'dias ativos',
    icon: 'flame-outline',
    color: COLORS.orange,
  },
  {
    label: 'Meta',
    value: '82%',
    detail: 'concluida',
    icon: 'trophy-outline',
    color: COLORS.red,
  },
];

const recentWorkouts = [
  {
    name: 'Peito, Ombro e Triceps',
    date: 'Hoje',
    exercises: '6 exercicios',
    time: '58 min',
  },
  {
    name: 'Costas e Biceps',
    date: 'Ontem',
    exercises: '7 exercicios',
    time: '1h 05min',
  },
  {
    name: 'Pernas Completo',
    date: 'Segunda',
    exercises: '8 exercicios',
    time: '1h 12min',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>FitTrack Pro</Text>
            <Text style={styles.title}>Seu treino de hoje</Text>
            <Text style={styles.subtitle}>
              Acompanhe sua evolucao, volume e frequencia.
            </Text>
          </View>

          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Proximo treino</Text>
              <Text style={styles.heroTitle}>Peito e Triceps</Text>
              <Text style={styles.heroText}>
                Foque em progressao de carga e boa execucao.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons name="fitness-outline" size={34} color={COLORS.primary} />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="play" size={18} color="#06111f" />
            <Text style={styles.primaryButtonText}>Iniciar treino</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {summary.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: `${item.color}22` }]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={item.color}
                />
              </View>

              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricDetail}>{item.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historico recente</Text>
          <Text style={styles.sectionAction}>Ver todos</Text>
        </View>

        {recentWorkouts.map((workout) => (
          <View key={workout.name} style={styles.workoutCard}>
            <View style={styles.workoutIcon}>
              <Ionicons name="barbell-outline" size={22} color={COLORS.primary} />
            </View>

            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDetails}>
                {workout.exercises} • {workout.time}
              </Text>
            </View>

            <Text style={styles.workoutDate}>{workout.date}</Text>
          </View>
        ))}

        <View style={styles.progressCard}>
          <View>
            <Text style={styles.sectionTitle}>Evolucao semanal</Text>
            <Text style={styles.progressText}>
              Voce treinou 5 de 6 dias planejados.
            </Text>
          </View>

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
    marginBottom: 18,
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
    fontSize: 24,
    fontWeight: '900',
  },
  heroText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 230,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    height: 52,
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
    marginBottom: 12,
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
    marginBottom: 12,
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
  },
  progressCard: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 24,
    padding: 18,
    marginTop: 10,
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