💰 Controle Financeiro
Protótipo desenvolvido como parte do projeto acadêmico de Engenharia de Software. O sistema tem como objetivo auxiliar usuários no gerenciamento de receitas e despesas, com cálculo automático de saldo e armazenamento local (e remoto após o login).

🚀 Status do Projeto
✅ Sprint 1 – Concluída: Foco: Fluxo de transações básico e cálculos. ✅ Sprint 2 – Concluída: Foco: Visualização de dados (gráficos, filtros) e API de autenticação. ✅ Sprint 3 – Concluída: Foco: Estabilidade e Testes Unitários.

🧠 Funcionalidades Implementadas
Autenticação (Login/Cadastro) – Permite o registro e login de usuários utilizando Node.js e SQLite.

Segurança de Dados – Armazena transações de forma individualizada por usuário no localStorage através de uma chave dinâmica.

Visualização Gráfica – Exibe gráficos de pizza por categoria (despesas) e gráficos de linha mensais (receitas vs. despesas) usando Chart.js.

Filtros Avançados – Permite filtrar transações por período (mês/ano) na listagem e nos gráficos.

Formulário de Transações – Permite inserir receitas e despesas com data, categoria e descrição.

Cálculo Automático de Saldo – Soma receitas, subtrai despesas e exibe o total atualizado.

Listagem de Transações – Exibe transações cadastradas em ordem decrescente de data.

Armazenamento Local (localStorage) – Mantém os dados após recarregar a página (com chave por usuário logado).

Exclusão de Transações – Botão para remover entradas individuais.

Exportar / Importar JSON – Exporta os dados do sistema e permite reimportar.

Interface Responsiva – Adaptável para desktop e dispositivos móveis.

🧪 Testes e Qualidade (Sprint 3)
A Sprint 3 foi focada em garantir a estabilidade e a qualidade do código com a implementação de testes automatizados.

Testes Unitários (Jest): Validação da lógica pura de manipulação de dados, incluindo cálculos de totais e filtros.

Estabilidade de Datas: Correção de bugs de fusos horários na agregação mensal, garantindo que os cálculos sejam estáveis em qualquer ambiente (via padronização UTC).

Diagrama de Classes (UML): Modelo da estrutura lógica das entidades principais.

Diagrama de Sequência (UML): Modelo do fluxo de autenticação (Login).

🧩 Estrutura de Pastas
controle-financeiro/
│
├── css/
│   └── style.css       # Estilos da interface
├── js/
│   └── script.js       # Lógica do Front-end (UI, Cálculos, Auth)
├── server.js           # Back-end Node.js (API de Registro e Login)
├── database.db         # Banco de dados SQLite
├── index.html          # Página principal da aplicação
├── README.md           # Documentação
└── assets/             # (Opcional para imagens ou ícones)
⚙️ Tecnologias Utilizadas
Front-end: HTML5, CSS3, JavaScript (ES6+), Chart.js

Back-end: Node.js, Express, SQLite3

Autenticação: JWT (JSON Web Tokens) e Bcrypt.js (hashing de senha)

Testes: Jest (Testes Unitários)

Controle de Versão: Git + GitHub

Organização: Trello (Kanban e organização de tarefas)
