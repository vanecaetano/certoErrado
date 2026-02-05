import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Política de Privacidade</h1>

      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        Esta aplicação utiliza cookies e serviços de terceiros (ex.: Google AdSense)
        para exibir anúncios e manter o serviço gratuito. As informações coletadas
        são limitadas ao necessário para veicular anúncios e melhorar a experiência do usuário.
      </p>

      <h2 className="font-semibold mt-4">Consentimento</h2>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Seu consentimento é gerenciado através do Google CMP (Consent Management Platform).
        Você pode gerenciar suas preferências de consentimento a qualquer momento através da
        mensagem de consentimento do Google.
      </p>

      <h2 className="font-semibold mt-4">Dados coletados</h2>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Podemos utilizar identificadores do navegador, preferências de exibição e
        dados anônimos agregados para otimizar anúncios. Nenhum dado pessoal sensível
        é coletado pelo aplicativo sem sua permissão.
      </p>

      <h2 className="font-semibold mt-4">Contato</h2>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
        Para questões sobre privacidade, envie email para: suporte@seudominio.com
      </p>
      <div className="flex gap-2 mb-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
        <Button onClick={() => navigate('/')}>Ir para Início</Button>
      </div>
    </div>
  );
}
