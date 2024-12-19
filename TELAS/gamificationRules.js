import firestore from '@react-native-firebase/firestore';

export const adicionarPontos = async (userId, pontosGanhos) => {
    try {
      const userRef = firestore().collection('users').doc(userId);
  
      // Verifica se o documento existe
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        console.log("Documento não encontrado. Criando um novo documento...");
        // Cria o documento com valores iniciais, incluindo a pontuação
        await userRef.set({
          gamification: {
            pontos: pontosGanhos,
            nivel: 1,
            medalhas: [],
          },
        });
        return;
      }
  
      // Atualiza os pontos do usuário
      await userRef.update({
        'gamification.pontos': firestore.FieldValue.increment(pontosGanhos),
      });
  
      // 🔶 Aguarda os pontos atualizados antes de atualizar o nível
      const userDocAtualizado = await userRef.get();
      const pontosAtualizados = userDocAtualizado.data().gamification.pontos || 0;
      console.log(`Pontos atualizados: ${pontosAtualizados}`);
  
      // Chama a função para atualizar o nível após adicionar pontos
      await atualizarNivel(userId);
    } catch (error) {
      console.error("Erro ao adicionar pontos:", error);
    }
  };

// Função para verificar nível (exemplo básico)
export const atualizarNivel = async (userId) => {
    try {
      const userRef = firestore().collection('users').doc(userId);
  
      // Obtém o documento do usuário
      const userDoc = await userRef.get();
      const { gamification } = userDoc.data();
  
      if (!gamification) {
        console.error("Dados de gamificação não encontrados para o usuário:", userId);
        return;
      }
  
      const { pontos, nivel } = gamification;
  
      // 🔶 Log para inspecionar pontos e nível
      //console.log("Dados de gamificação:", gamification);
      //console.log(`Pontos: ${pontos}, Nível atual: ${nivel}`);
  
      // Regras de níveis
      const regrasDeNivel = [
        { nivel: 1, minPontos: 0, maxPontos: 50 },
        { nivel: 2, minPontos: 51, maxPontos: 100 },
        { nivel: 3, minPontos: 101, maxPontos: 150 },
        { nivel: 4, minPontos: 151, maxPontos: 200 },
        { nivel: 5, minPontos: 201, maxPontos: 250 },
        { nivel: 6, minPontos: 251, maxPontos: 300 },
        { nivel: 7, minPontos: 301, maxPontos: 400 },
        { nivel: 8, minPontos: 401, maxPontos: 500 },
        { nivel: 9, minPontos: 501, maxPontos: 600 },
        { nivel: 10, minPontos: 601, maxPontos: Infinity }, // Nível 10 é ilimitado
      ];
  
      // Determina o novo nível com base nos pontos
      const novoNivel = regrasDeNivel.find(
        (regra) => pontos >= regra.minPontos && pontos <= regra.maxPontos
      )?.nivel;
  
      //console.log(`Novo nível calculado: ${novoNivel}, Nível atual: ${nivel}`);
  
      if (novoNivel && novoNivel !== nivel) {
        await userRef.update({
          'gamification.nivel': novoNivel,
        });
        console.log(`Usuário ${userId} subiu para o nível ${novoNivel}!`);
      }
    } catch (error) {
      console.error("Erro ao atualizar nível:", error);
    }
  };
  
  
