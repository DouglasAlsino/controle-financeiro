// script.test.js
// NO INÍCIO do seu script.test.js

// Mock do Chart.js para evitar ReferenceError
global.Chart = jest.fn().mockImplementation(() => {
    return {
        update: jest.fn(),
        destroy: jest.fn(),
        data: {
            labels: [],
            datasets: [{ data: [] }, { data: [] }]
        }
    };
});

// Mock de outras variáveis globais que podem ser necessárias
global.fetch = jest.fn();
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.alert = jest.fn();
global.confirm = jest.fn().mockReturnValue(true);


// ... seus blocos describe/test
// 1. IMPORTAÇÃO: Importa as funções que você exportou do seu script.js
const { 
    getStorageKey, 
    loadTransactions, 
    saveTransactions, 
    updateTotals,
    computeMonthlyTotals,
    computeCategoryTotals
} = require('./js/script'); // Ajuste o caminho se necessário

// 2. MOCK DO LOCALSTORAGE: Simula o comportamento do localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        // Funções adicionais para os testes:
        getStore: () => store, 
        setStore: (newStore) => { store = newStore; }
    };
})();

// Define o mock como global para o Jest
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------------
// DADOS DE TESTE (Setup)
// ---------------------------------------------------------------------------------
const TEST_EMAIL = 'user@test.com';
const TEST_KEY = `transactions_${TEST_EMAIL}`;

const mockData = [
    { id: 1, tipo: 'income', value: 1000.00, date: '2025-12-10' }, 
    { id: 2, tipo: 'expense', value: 300.00, date: '2025-12-15' },
    { id: 3, tipo: 'income', value: 500.00, date: '2025-11-20' }, 
    { id: 4, tipo: 'expense', value: 200.00, date: '2025-12-01', category: 'Alimentação' },
    { id: 5, tipo: 'expense', value: 100.00, date: '2025-12-05', category: 'Transporte' },
];


// ---------------------------------------------------------------------------------
// TESTES DE LÓGICA (Exemplos)
// ---------------------------------------------------------------------------------

describe('STORAGE HELPERS (Persistência)', () => {
    beforeEach(() => {
        localStorage.clear(); // Limpa o mock antes de cada teste
        localStorage.setItem('user_email', TEST_EMAIL); // Simula o login
    });

    test('getStorageKey deve retornar a chave correta com o email do usuário', () => {
        expect(getStorageKey()).toBe(TEST_KEY);
    });

    test('loadTransactions deve carregar dados corretamente', () => {
        // Simula o dado salvo no localStorage
        localStorage.setItem(TEST_KEY, JSON.stringify(mockData)); 
        const loaded = loadTransactions();
        expect(loaded.length).toBe(5);
        expect(loaded[0].value).toBe(1000.00);
    });
    
    test('saveTransactions deve salvar dados no localStorage com a chave correta', () => {
        saveTransactions(mockData.slice(0, 2)); // Salva apenas as duas primeiras
        const savedRaw = localStorage.getItem(TEST_KEY);
        const savedData = JSON.parse(savedRaw);
        expect(savedData.length).toBe(2);
        expect(savedData[0].id).toBe(1);
    });
});

describe('CALCULATIONS (Gráficos e Totais)', () => {
    // ...
    test('computeCategoryTotals deve calcular corretamente e agrupar despesas', () => {
        // VERIFIQUE ESTA PARTE!
        const despesas = [
            // TODAS as transações PRECISAM ter 'type: "expense"'
            { description: 'Almoço', category: 'Alimentação', value: 100, type: 'expense', date: '2024-12-01' }, 
            { description: 'Jantar', category: 'Alimentação', value: 100, type: 'expense', date: '2024-12-01' },
            { description: 'Gasolina', category: 'Transporte', value: 100, type: 'expense', date: '2024-12-01' },
        ];
        
        const { labels, values } = computeCategoryTotals(despesas, 8); // top 8

        expect(labels).toEqual(['Alimentação', 'Transporte']); // Linha 119
        expect(values).toEqual([200, 100]); 
    });
    // ...
});