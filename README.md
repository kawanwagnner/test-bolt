# EscalasApp

Um aplicativo React Native com Expo para gerenciamento de escalas dinâmicas com temas/tarefas organizadas por dia.

## 🚀 Funcionalidades

- **Autenticação segura** com email/senha
- **Papéis de usuário**: Admin e Membro
- **Escalas dinâmicas** com data e temas
- **Slots configuráveis** com modo livre ou manual
- **Inscrições automáticas** ou atribuições manuais
- **Notificações inteligentes**: 24h antes (todos), 48h antes (professores)
- **Atualizações em tempo real**
- **Offline-first** com cache inteligente

## 🛠 Tech Stack

- **React Native** com Expo SDK 53
- **TypeScript** para type safety
- **Supabase** para backend e autenticação
- **React Query** para estado e cache
- **React Hook Form + Zod** para formulários
- **Expo Notifications** para lembretes
- **Date-fns** para manipulação de datas

## 📦 Instalação

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd escalas-app
npm install
```

### 2. Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie a URL e Anon Key do projeto
3. Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

4. Preencha as variáveis:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Configuração do banco de dados

1. Acesse o SQL Editor no Supabase Dashboard
2. Execute o script SQL localizado em `supabase/migrations/create_escalas_schema.sql`
3. Ative o Realtime nas tabelas:
   - Vá em Database > Replication
   - Ative Realtime para as tabelas: `slots`, `assignments`

### 4. Executar o aplicativo

```bash
npm run dev
```

## 👥 Tipos de Usuário

### Admin
- Pode criar, editar e excluir escalas
- Gerencia slots (horários, temas, capacidade)
- Faz atribuições manuais
- Visualiza todos os dados

### Membro
- Visualiza escalas disponíveis
- Inscreve-se em slots livres
- Recebe notificações automáticas
- Gerencia suas próprias inscrições

## 📱 Estrutura do App

### Navegação Principal (Tabs)
- **Início**: Minhas escalas e próximos compromissos
- **Escalas**: Lista todas as escalas disponíveis
- **Perfil**: Informações do usuário e configurações

### Fluxos de Tela
- **Autenticação**: Login/Registro
- **Escalas**: Lista → Detalhes → Gerenciar (admin)
- **Slots**: Visualizar → Inscrever/Cancelar → Gerenciar (admin)

## 🔔 Notificações

- **24h antes**: Todos os participantes
- **48h antes**: Apenas professores (perfis com `is_teacher: true`)
- **Automáticas**: Agendadas ao fazer inscrição
- **Cancelamento**: Removidas ao cancelar inscrição

## 🔒 Segurança

- **RLS (Row Level Security)** habilitado em todas as tabelas
- **Políticas específicas** por papel de usuário
- **Tokens seguros** armazenados com Expo SecureStore
- **Validação de entrada** com Zod em todos os formulários

## 🧪 Conta de Teste

Para criar uma conta de administrador, use um email terminado em `@admin.test`:

```
Email: admin@admin.test
Senha: 123456
```

## 📄 Estrutura de Arquivos

```
src/
├── components/          # Componentes reutilizáveis
├── features/           # Features organizadas por domínio
│   ├── auth/          # Autenticação
│   ├── schedules/     # Gestão de escalas
│   ├── slots/         # Gestão de slots
│   ├── assignments/   # Gestão de inscrições
│   └── themes/        # Gestão de temas
├── lib/               # Utilitários e configurações
├── providers/         # Providers do app
└── utils/             # Funções utilitárias
```

## 🚀 Deploy

Para fazer deploy do aplicativo:

1. **Web**: `npm run build:web`
2. **Móvel**: Use EAS Build para iOS/Android

```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar build
eas build:configure

# Fazer build
eas build --platform all
```

## 📝 Próximos Passos

- [ ] Implementar filtros por tema/data
- [ ] Adicionar dashboard de estatísticas (admin)
- [ ] Implementar histórico de escalas
- [ ] Adicionar modo dark theme
- [ ] Configurar push notifications remotas

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.