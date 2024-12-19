import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Função para salvar o contador no Firebase
export const salvarContadorNoFirebase = async (userId, nomeConquista, novoContador) => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();

    // Verifica o contador atual no Firebase antes de salvar
    const contadorAtual = userDoc.data()?.contadores?.[nomeConquista] || 0;
    if (novoContador < contadorAtual) {
      console.warn(`Novo contador (${novoContador}) é menor que o atual (${contadorAtual}). Ignorando.`);
      return;
    }

    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        [`contadores.${nomeConquista}`]: novoContador,
      });

    console.log(`Contador atualizado no Firebase para ${nomeConquista}: ${novoContador}`);
  } catch (error) {
    console.error(`Erro ao salvar o contador no Firebase para ${nomeConquista}:`, error);
  }
};

export const salvarMedalhaNoFirebase = async (userId, nomeMedalha) => {
  try {
    const userRef = firestore().collection('users').doc(userId);

    // Atualiza o array de medalhas apenas se ainda não foi adicionada
    await userRef.update({
      'gamification.medalhas': firestore.FieldValue.arrayUnion(nomeMedalha),
    });

    console.log(`Medalha "${nomeMedalha}" salva no Firebase.`);
  } catch (error) {
    console.error(`Erro ao salvar medalha "${nomeMedalha}":`, error);
  }
};

// Regras para cada conquista
const conquistasRegras = {
  "Proativo no Pré-natal": {
    limite: 4, // Quantidade necessária para desbloquear
    descricao: "Monitorar e registrar 6 consultas completas em pelo menos 5 grávidas.",
    pontos: 30,
  },
  "Apoio à Saúde": {
    limite: 2,
    descricao: "Acompanhar e registrar 10 novos exames de IST em 10 grávidas.",
    pontos: 20,
  },
  "Cuidador Odontológico": {
    limite: 2,
    descricao: "Registrar atendimento odontológico de pelo menos 15 gestantes.",
    pontos: 20,
  },
  "Herói dos Pequeninos": {
    limite: 2,
    descricao: "Registrar pelo 25 vacinas de crianças.",
    pontos: 20,
  },
  'Monitor de Pressão': {
    limite: 2,
    descricao: "Registrar pelo 25 vacinas de crianças.",
    pontos: 20, 
  },
  'Combatente do Diabetes': {
    limite: 2,
    descricao: "Registrar pelo 25 vacinas de crianças.",
    pontos: 20, 
  },
  'Saúde Feminina': {
    limite: 2,
    descricao: "Registrar pelo 25 vacinas de crianças.",
    pontos: 20, 
  },
};

// Função para incrementar o contador
export const incrementarContador = (contador) => contador + 1;

// Função para verificar se uma conquista foi atingida
export const verificarConquista = (nomeConquista, contadorAtual) => {
  const regra = conquistasRegras[nomeConquista];
  if (!regra) {
    console.error(`Conquista "${nomeConquista}" não encontrada nas regras.`);
    return false;
  }

  if (contadorAtual >= regra.limite) {
    console.log(`Conquista desbloqueada: ${nomeConquista}`);
    return { desbloqueada: true, pontos: regra.pontos };
  }

  return { desbloqueada: false };
};

// Função para registrar uma consulta e verificar conquistas
export const registrarConsulta = async (contadorConsultas, setContadorConsultas, nomeConquista) => {
  try {
    const userId = auth().currentUser?.uid; // Obtém o ID do usuário autenticado

    if (!userId) {
      console.error('Usuário não autenticado.');
      return;
    }

    // Carrega o contador atual do Firebase
    const contadorAtualFirebase = await carregarContadorDoFirebase(nomeConquista);

    // Verifica o valor inicial do contador
    const contadorAtual = contadorAtualFirebase !== undefined ? contadorAtualFirebase : contadorConsultas;

    // Incrementa o contador localmente e no Firebase
    const novoContador = incrementarContador(contadorAtual);
    setContadorConsultas(novoContador);

    // Salva o contador atualizado no Firebase
    await salvarContadorNoFirebase(userId, nomeConquista, novoContador);

    // Verifica se a conquista foi desbloqueada
    const conquistaResultado = verificarConquista(nomeConquista, novoContador);

    if (conquistaResultado.desbloqueada) {
      await salvarMedalhaNoFirebase(userId, nomeConquista);
      return conquistaResultado.pontos;
    }

    // Se a conquista ainda não foi desbloqueada, retorna 0
    return 0;
  } catch (error) {
    console.error('Erro ao registrar consulta:', error);
    return 0;
  }
};

// Função para carregar um contador específico de conquistas
export const carregarContadorDoFirebase = async (nomeConquista) => {
  try {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      console.error("Usuário não autenticado.");
      return 0;
    }

    const userDoc = await firestore().collection('users').doc(userId).get();

    if (userDoc.exists) {
      const contador = userDoc.data()?.contadores?.[nomeConquista] || 0;
      console.log(`Contador carregado para "${nomeConquista}": ${contador}`);
      return contador;
    }
    return 0;
  } catch (error) {
    console.error(`Erro ao carregar contador do Firebase para ${nomeConquista}:`, error);
    return 0;
  }
};