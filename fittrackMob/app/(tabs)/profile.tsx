import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#07111f',
  card: '#0d1b31',
  cardSoft: '#12213a',
  primary: '#00d4a6',
  orange: '#ffb84d',
  red: '#ff6b6b',
  blue: '#4c8dff',
  text: '#f3f7ff',
  muted: '#91a1bb',
  border: '#203754',
};

const STORAGE_PROFILE_KEY = '@fittrack:profile';
const STORAGE_WEIGHT_KEY = '@fittrack:body-weight';
const WORKOUT_HISTORY_KEY = '@fittrack:workout-history';

type ProfileData = {
  name: string;
  age: string;
  height: string;
  goalWeight: string;
};

type WeightRecord = {
  value: number;
  date: string;
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
  if (bmi < 18.5) {
    return {
      label: 'Abaixo do peso',
      color: COLORS.blue,
      message: 'Seu IMC está abaixo da faixa considerada normal.',
    };
  }

  if (bmi < 25) {
    return {
      label: 'Peso normal',
      color: COLORS.primary,
      message: 'Seu IMC está dentro da faixa considerada normal.',
    };
  }

  if (bmi < 30) {
    return {
      label: 'Sobrepeso',
      color: COLORS.orange,
      message: 'Seu IMC está acima da faixa considerada normal.',
    };
  }

  return {
    label: 'IMC alto',
    color: COLORS.red,
    message: 'Seu IMC está alto. Use isso como alerta geral de acompanhamento.',
  };
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [currentWeight, setCurrentWeight] = useState(0);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  async function carregarPerfil() {
    try {
      const [profileData, weightData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_PROFILE_KEY),
        AsyncStorage.getItem(STORAGE_WEIGHT_KEY),
      ]);

      if (profileData) {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(profileData) });
      } else {
        setProfile(DEFAULT_PROFILE);
      }

      if (weightData) {
        const weights: WeightRecord[] = JSON.parse(weightData);
        setCurrentWeight(weights[0]?.value ?? 0);
      } else {
        setCurrentWeight(0);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar seu perfil.');
    }
  }

  function updateField(field: keyof ProfileData, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function salvarPerfil() {
    const height = parseNumber(profile.height);
    const age = Number(profile.age);
    const goalWeight = parseNumber(profile.goalWeight);

    if (!profile.name.trim()) {
      Alert.alert('Nome inválido', 'Digite seu nome.');
      return;
    }

    if (!age || age <= 0) {
      Alert.alert('Idade inválida', 'Digite uma idade válida.');
      return;
    }

    if (!height || height <= 0) {
      Alert.alert('Altura inválida', 'Digite sua altura em metros. Exemplo: 1.83');
      return;
    }

    if (!goalWeight || goalWeight <= 0) {
      Alert.alert('Meta inválida', 'Digite uma meta de peso válida.');
      return;
    }

    try {
      await AsyncStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
      Alert.alert('Perfil salvo', 'Seus dados foram atualizados.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar seu perfil.');
    }
  }

  async function limparDados() {
    Alert.alert(
      'Limpar dados',
      'Isso vai apagar perfil, peso corporal e historico de treinos deste aparelho.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all([
                AsyncStorage.removeItem(STORAGE_PROFILE_KEY),
                AsyncStorage.removeItem(STORAGE_WEIGHT_KEY),
                AsyncStorage.removeItem(WORKOUT_HISTORY_KEY),
              ]);

              setProfile(DEFAULT_PROFILE);
              setCurrentWeight(0);

              Alert.alert('Dados limpos', 'O app foi resetado neste aparelho.');
            } catch {
              Alert.alert('Erro', 'Não foi possível limpar os dados.');
            }
          },
        },
      ]
    );
  }

  // Nova função de partilha
  async function compartilharPerfil() {
    try {
      if (!profile.name) {
        Alert.alert('Aviso', 'Preencha o seu nome antes de partilhar o seu perfil.');
        return;
      }
      
      const mensagem = `Estou a usar o FitTrack Mobile! 🏋️‍♂️\n\nSou o ${profile.name}, tenho ${profile.age} anos e o meu IMC atual é ${bmi ? formatNumber(bmi) : '--'}. A minha meta de peso é chegar aos ${profile.goalWeight} kg.\n\nJunta-te a mim na evolução do treino!`;
      
      await Share.share({
        message: mensagem,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível partilhar o perfil.');
    }
  }

  const heightMeters = parseNumber(profile.height || '0');

  const bmi =
    currentWeight && heightMeters ? currentWeight / (heightMeters * heightMeters) : 0;

  const status = bmi ? getBmiStatus(bmi) : null;

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
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Dados pessoais</Text>
            <Text style={styles.title}>Perfil</Text>
            <Text style={styles.subtitle}>
              Configure seus dados para o app calcular IMC, meta de peso e progresso.
            </Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={36} color={COLORS.primary} />
            </View>

            <Text style={styles.profileName}>
              {profile.name || 'Novo usuário'}
            </Text>

            <Text style={styles.profileInfo}>
              {profile.age || '--'} anos • {profile.height || '--'} m
            </Text>

            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>IMC atual</Text>

              <Text style={styles.statusValue}>
                {bmi ? formatNumber(bmi) : '--'}
              </Text>

              <Text style={[styles.statusText, { color: status?.color ?? COLORS.muted }]}>
                {status?.label ?? 'Registre seu peso na tela Início'}
              </Text>

              <Text style={styles.statusMessage}>
                {status?.message ??
                  'Depois de registrar peso e altura, o resultado aparece aqui.'}
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Editar dados</Text>

            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              value={profile.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Digite seu nome"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Idade</Text>
            <TextInput
              value={profile.age}
              onChangeText={(value) => updateField('age', value)}
              placeholder="Ex: 20"
              placeholderTextColor={COLORS.muted}
              keyboardType="number-pad"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Altura em metros</Text>
            <TextInput
              value={profile.height}
              onChangeText={(value) => updateField('height', value)}
              placeholder="Ex: 1.83"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Meta de peso em kg</Text>
            <TextInput
              value={profile.goalWeight}
              onChangeText={(value) => updateField('goalWeight', value)}
              placeholder="Ex: 100"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.primaryButton}
              onPress={salvarPerfil}
            >
              <Ionicons name="save-outline" size={18} color="#06111f" />
              <Text style={styles.primaryButtonText}>Salvar perfil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="phone-portrait-outline" size={24} color={COLORS.primary} />

            <Text style={styles.infoText}>
              Os dados ficam salvos apenas neste aparelho. Quando outra pessoa abrir
              em outro celular, ela vai preencher os próprios dados.
            </Text>
          </View>

          {/* NOVO BOTÃO DE PARTILHA AQUI */}
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.shareButton}
            onPress={compartilharPerfil}
          >
            <Ionicons name="share-social-outline" size={18} color={COLORS.blue} />
            <Text style={styles.shareButtonText}>Partilhar a minha evolução</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.dangerButton}
            onPress={limparDados}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.orange} />
            <Text style={styles.dangerButtonText}>Limpar dados deste aparelho</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },
  header: {
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
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 21,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: '#00d4a619',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  profileInfo: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 5,
  },
  statusBox: {
    width: '100%',
    backgroundColor: COLORS.cardSoft,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 18,
    alignItems: 'center',
  },
  statusLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  statusValue: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  statusMessage: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 10,
  },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.cardSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    paddingHorizontal: 15,
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
  infoCard: {
    backgroundColor: COLORS.cardSoft,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  infoText: {
    color: COLORS.muted,
    lineHeight: 20,
    fontSize: 13,
    flex: 1,
  },
  shareButton: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  shareButtonText: {
    color: COLORS.blue,
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
  },
  dangerButtonText: {
    color: COLORS.orange,
    fontSize: 15,
    fontWeight: '900',
  },
});