import React, { useMemo, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#07111f',
  card: '#0d1b31',
  cardSoft: '#12213a',
  primary: '#00d4a6',
  blue: '#4c8dff',
  orange: '#ffb84d',
  text: '#f3f7ff',
  muted: '#91a1bb',
  border: '#203754',
};

const workoutPlans = [
  {
    title: 'Peito, Ombro e Triceps',
    level: 'Intermediario',
    duration: '55 min',
    category: 'Peito',
    exercises: ['Supino reto', 'Supino inclinado', 'Desenvolvimento', 'Triceps corda'],
  },
  {
    title: 'Costas e Biceps',
    level: 'Intermediario',
    duration: '1h 05min',
    category: 'Costas',
    exercises: ['Puxada alta', 'Remada curvada', 'Remada baixa', 'Rosca direta'],
  },
  {
    title: 'Pernas Completo',
    level: 'Avancado',
    duration: '1h 15min',
    category: 'Pernas',
    exercises: ['Agachamento', 'Leg press', 'Cadeira extensora', 'Mesa flexora'],
  },
  {
    title: 'Bracos e Abdomen',
    level: 'Iniciante',
    duration: '45 min',
    category: 'Bracos',
    exercises: ['Rosca alternada', 'Triceps testa', 'Prancha', 'Abdominal infra'],
  },
];

const categories = ['Todos', 'Peito', 'Costas', 'Pernas', 'Bracos'];

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [search, setSearch] = useState('');

  const filteredPlans = useMemo(() => {
    return workoutPlans.filter((plan) => {
      const sameCategory =
        selectedCategory === 'Todos' || plan.category === selectedCategory;

      const searchText = search.trim().toLowerCase();

      const matchSearch =
        searchText.length === 0 ||
        plan.title.toLowerCase().includes(searchText) ||
        plan.exercises.some((exercise) =>
          exercise.toLowerCase().includes(searchText)
        );

      return sameCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  function abrirTreino(plan: (typeof workoutPlans)[0]) {
    router.push({
      pathname: '/modal',
      params: {
        title: plan.title,
        time: plan.duration,
        level: plan.level,
        exercises: plan.exercises.join(', '),
      },
    } as any);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Biblioteca</Text>
            <Text style={styles.title}>Treinos</Text>
            <Text style={styles.subtitle}>
              Escolha um treino pronto, filtre por grupo muscular ou pesquise exercicios.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addButton}
            onPress={() => Alert.alert('Criar treino', 'Funcao de criar treino em desenvolvimento.')}
          >
            <Ionicons name="add" size={25} color="#06111f" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.muted} />
          <TextInput
            placeholder="Buscar treino ou exercicio"
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.highlightCard}
          onPress={() => abrirTreino(workoutPlans[0])}
        >
          <View style={styles.highlightIcon}>
            <Ionicons name="flash-outline" size={26} color={COLORS.primary} />
          </View>

          <View style={styles.highlightInfo}>
            <Text style={styles.highlightTitle}>Sugestao do dia</Text>
            <Text style={styles.highlightText}>
              Treino superior com foco em hipertrofia e progressao de carga.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Planos de treino</Text>
          <Text style={styles.counter}>{filteredPlans.length} encontrados</Text>
        </View>

        {filteredPlans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={32} color={COLORS.muted} />
            <Text style={styles.emptyTitle}>Nenhum treino encontrado</Text>
            <Text style={styles.emptyText}>
              Tente pesquisar outro nome ou selecionar outra categoria.
            </Text>
          </View>
        ) : (
          filteredPlans.map((plan) => (
            <TouchableOpacity
              activeOpacity={0.86}
              key={plan.title}
              style={styles.planCard}
              onPress={() => abrirTreino(plan)}
            >
              <View style={styles.planHeader}>
                <View style={styles.planIcon}>
                  <Ionicons name="barbell-outline" size={23} color={COLORS.primary} />
                </View>

                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planMeta}>
                    {plan.level} • {plan.duration}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
              </View>

              <View style={styles.exerciseList}>
                {plan.exercises.map((exercise) => (
                  <View key={exercise} style={styles.exerciseItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    <Text style={styles.exerciseText}>{exercise}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryButton}
                onPress={() => abrirTreino(plan)}
              >
                <Ionicons name="play-outline" size={18} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>Comecar este treino</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={24} color={COLORS.orange} />

          <View style={styles.tipInfo}>
            <Text style={styles.tipTitle}>Dica rapida</Text>
            <Text style={styles.tipText}>
              Anote carga, repeticoes e descanso. Isso deixa sua evolucao muito
              mais facil de acompanhar.
            </Text>
          </View>
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
    marginBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
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
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
    maxWidth: 310,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  categoryList: {
    gap: 10,
    paddingBottom: 18,
  },
  categoryButton: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.muted,
    fontWeight: '800',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#06111f',
  },
  highlightCard: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  highlightIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightInfo: {
    flex: 1,
  },
  highlightTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  highlightText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  counter: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  planCard: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  planMeta: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  exerciseList: {
    gap: 10,
    marginBottom: 18,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  exerciseText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
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
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 10,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  tipText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});