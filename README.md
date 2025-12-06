# 💰 Controle Financeiro

Protótipo desenvolvido como parte do projeto acadêmico de Engenharia de Software.  
O sistema tem como objetivo auxiliar usuários no **gerenciamento de receitas e despesas**, com cálculo automático de saldo e armazenamento local.

---

## 🛠️ Como Executar o Projeto

Para rodar a aplicação localmente, incluindo o sistema de login, siga os passos abaixo:

---

### 🔧 Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js**
- **npm**

---

### 🚀 Passo a Passo

#### 1. Clone o repositório (ou baixe os arquivos):

```bash
git clone https://github.com/seu-usuario/controle-financeiro.git
```

#### 2. Acesse o repositório:

```bash
cd controle-financeiro
```

#### 3. Instale as dependências:

```bash 
npm install
```

#### 4. Inicie o servidor:

```bash
npm start
```

---
## 🚀 Status do Projeto
✅ **Sprint 1 – Concluída**  
Foco: Implementação inicial do fluxo de transações (formulário, listagem e cálculos).

---

## 🧠 Funcionalidades Implementadas
- [x] **Formulário de Transações** – permite inserir receitas e despesas com data, categoria e descrição.
- [x] **Cálculo Automático de Saldo** – soma receitas, subtrai despesas e exibe o total atualizado.
- [x] **Listagem de Transações** – exibe transações cadastradas em ordem decrescente de data.
- [x] **Armazenamento Local (localStorage)** – mantém os dados após recarregar a página.
- [x] **Exclusão de Transações** – botão para remover entradas individuais.
- [x] **Exportar / Importar JSON** – exporta os dados do sistema e permite reimportar.
- [x] **Interface Responsiva** – adaptável para desktop e dispositivos móveis.

---

## 🧩 Estrutura de Pastas
controle-financeiro/
│
├── css/
│ └── style.css
├── js/
│ └── script.js
├── index.html
├── README.md
└── assets/ (opcional para imagens ou ícones)


---

## ⚙️ Tecnologias Utilizadas
- **HTML5**  
- **CSS3 (Flexbox e Responsividade)**  
- **JavaScript (ES6+)**  
- **LocalStorage (armazenamento de dados)**  
- **Git + GitHub (controle de versão)**  
- **Trello (Kanban e organização de tarefas)**  

---
✅ **Sprint 2 – Concluída**  
- [x] Implementar visualização de **gráficos de despesas e receitas** (Chart.js).  
- [x] Adicionar **filtros por período (mês/ano)**.  
- [x] Implementar **validação mais robusta de formulário**.  
- [x] Melhorar **design do painel de totais** (cores e ícones).  
- [x] Iniciar **planejamento para autenticação de usuário** (fase futura).

---

## 🧾 Próximos Passos (Sprint 3)
## Testes

- [ ] **Testes unitários** - para cada funcionalidade crítica.
