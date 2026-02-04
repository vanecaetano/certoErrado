# Estratégias de Monetização - Certo ou Errado?

Este documento descreve as estratégias de monetização implementadas e sugeridas para o aplicativo.

## Espaços Reservados para Anúncios

### 1. Banner Inferior Fixo
- **Localização**: Parte inferior da tela (componente `AdSpace`)
- **Tamanho**: 320x100px (padrão)
- **Comportamento**: Fixo, não interfere no jogo
- **Implementação**: Substitua o conteúdo do componente `AdSpace` pela sua solução de anúncios

### 2. Estratégias Recomendadas

#### A. Anúncios de Recompensa
**Quando mostrar**: 
- Após responder uma pergunta incorretamente
- Opção para assistir anúncio e ganhar uma "segunda chance"
- Opção para dobrar pontuação ao assistir anúncio no final do jogo

**Implementação sugerida**:
```typescript
// Exemplo de integração
const showRewardedAd = async () => {
  // Sua lógica de anúncio de recompensa aqui
  // Ex: Google AdMob Rewarded Ad
  if (adWatched) {
    // Dobrar pontuação ou dar segunda chance
  }
};
```

#### B. Anúncios Intersticiais
**Quando mostrar**:
- Entre rodadas (após X perguntas respondidas)
- Ao finalizar um jogo
- Ao voltar para a tela inicial

**Frequência recomendada**: 
- Máximo 1 anúncio a cada 5-10 perguntas
- Nunca durante uma pergunta ativa

#### C. Anúncios Nativos
**Onde usar**:
- Na tela inicial (entre os cards de assuntos)
- Na tela de resultados (entre os gráficos)
- Integrados ao design para não parecer intrusivos

#### D. Anúncios Banner
**Onde usar**:
- Parte superior ou inferior das telas
- Durante o jogo (apenas se não distrair)

## Integração com Provedores de Anúncios

### Google AdMob (Recomendado para Mobile)
```bash
npm install react-native-google-mobile-ads
# ou para web
npm install @react-native-community/google-mobile-ads
```

### Google AdSense (Para Web)
Adicione o script no `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
```

### Outros Provedores
- **Unity Ads**: Bom para jogos
- **AppLovin**: Alto CPM
- **Facebook Audience Network**: Boa segmentação

## Implementação no Código

### 1. Substituir AdSpace Component

Edite `src/components/layout/AdSpace.tsx`:

```typescript
export function AdSpace({ position = 'bottom' }: AdSpaceProps) {
  // Substitua este conteúdo pela sua solução de anúncios
  return (
    <div className="ad-container">
      {/* Sua integração de anúncios aqui */}
      <YourAdComponent />
    </div>
  );
}
```

### 2. Adicionar Anúncios de Recompensa

Crie um hook personalizado:

```typescript
// src/hooks/useRewardedAd.ts
export function useRewardedAd() {
  const showRewardedAd = async (): Promise<boolean> => {
    // Implementar lógica de anúncio de recompensa
    return new Promise((resolve) => {
      // Sua lógica aqui
      resolve(true); // true se assistido, false se cancelado
    });
  };

  return { showRewardedAd };
}
```

### 3. Integrar no Jogo

No componente `GamePage`, adicione opção de recompensa:

```typescript
const { showRewardedAd } = useRewardedAd();

const handleReward = async () => {
  const watched = await showRewardedAd();
  if (watched) {
    // Dar segunda chance ou dobrar pontuação
  }
};
```

## Boas Práticas

1. **Não seja intrusivo**: Anúncios não devem atrapalhar a experiência do usuário
2. **Ofereça valor**: Anúncios de recompensa devem oferecer benefícios claros
3. **Respeite limites**: Não mostre muitos anúncios seguidos
4. **Teste A/B**: Teste diferentes frequências e posicionamentos
5. **Analytics**: Rastreie quais tipos de anúncios geram mais receita

## Métricas para Acompanhar

- **eCPM**: Receita por mil impressões
- **Fill Rate**: Taxa de preenchimento de anúncios
- **CTR**: Taxa de cliques
- **Retenção**: Impacto dos anúncios na retenção de usuários
- **Tempo de sessão**: Se anúncios estão reduzindo o tempo de jogo

## Considerações Legais

- **GDPR**: Implemente consentimento para usuários da UE
- **COPPA**: Cuidado com anúncios para menores de 13 anos
- **Política de Privacidade**: Atualize com informações sobre anúncios
- **Termos de Uso**: Inclua informações sobre monetização

## Exemplo de Fluxo de Monetização

1. **Usuário inicia jogo**: Banner inferior visível (não intrusivo)
2. **Durante jogo**: Sem anúncios (experiência limpa)
3. **Após erro**: Opção de assistir anúncio para segunda chance
4. **Final do jogo**: Opção de assistir anúncio para dobrar pontuação
5. **Entre jogos**: Anúncio intersticial (máximo 1 por sessão)

## Próximos Passos

1. Escolher provedor de anúncios
2. Criar conta e obter IDs de anúncios
3. Integrar SDK do provedor
4. Substituir componentes `AdSpace` pela implementação real
5. Testar em diferentes dispositivos
6. Monitorar métricas e ajustar estratégia
