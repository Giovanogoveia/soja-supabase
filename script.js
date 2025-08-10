import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dylziaqkyavkfwjepqkp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bHppYXFreWF2a2Z3amVwcWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTc1OTgsImV4cCI6MjA2ODAzMzU5OH0.gy5jXxKOTgeCf0Rwq7ktLTz1pyoZ8dJjZOK9UB9rHCM'
);

// ===== helpers =====
const TABELA_GERAL = 'geral';

// nomes canônicos que existem no Supabase
const CARDS = [
  { nome: 'soja', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
  { nome: 'milho', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
  { nome: 'trigo', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
  { nome: 'lenha', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
  { nome: 'armazenamento', campos: ['capacidade_total', 'utilizado', 'disponivel'] },
  { nome: 'pessoa', campos: ['total_funcionarios', 'ativos', 'inativos'] },
  { nome: TABELA_GERAL, campos: ['estoque_total', 'entrada', 'saida', 'saldo'] },
];

// apelidos de nomes de cards no HTML -> canônico
const NOME_ALIAS = {
  miho: 'milho',
  pessoal: 'pessoa',
  armazenagem: 'armazenamento',
};
const REVERSE_ALIAS = {
  milho: ['miho'],
  pessoa: ['pessoal'],
  armazenamento: ['armazenagem'],
};

// mapeia nomes de campos vindos do form para o canônico usado no DB
const CAMPO_ALIAS_FORWARD = {
  trigo: { estoque: 'estoqueatual' },
  lenha: { estoque: 'estoqueatual' },
};
// quando lendo do DB, aceita alternativas também
const CAMPO_ALT_READ = {
  trigo: { estoqueatual: ['estoque'] },
  lenha: { estoqueatual: ['estoque'] },
};

// rótulos fixos por card/campo (texto mostrado no HTML)
const ROTULOS = {
  soja: { estoqueatual: 'Estoque Atual', meta: 'Meta', recebimento: 'Recebimento', percentual_metal: 'Percentual Meta' },
  milho:{ estoqueatual: 'Estoque Atual', meta: 'Meta', recebimento: 'Recebimento', percentual_metal: 'Percentual Meta' },
  trigo:{ estoqueatual: 'Estoque Atual', meta: 'Meta', recebimento: 'Recebimento', percentual_metal: 'Percentual Meta' },
  lenha:{ estoqueatual: 'Estoque Atual', meta: 'Meta', recebimento: 'Recebimento', percentual_metal: 'Percentual Meta' },
  armazenamento: { capacidade_total: 'Capacidade', utilizado: 'Utilizado', disponivel: 'Disponível' },
  pessoa:{ total_funcionarios: 'Funcionários', ativos: 'Ativos', inativos: 'Inativos' },
  [TABELA_GERAL]: { estoque_total: 'Total', entrada: 'Entrada', saida: 'Saída', saldo: 'Saldo' },
};

// qual campo vira o “R$” em cada card
const CHAVE_PRECO = {
  soja: 'percentual_metal',
  milho: 'percentual_metal',
  trigo: 'percentual_metal',
  lenha: 'percentual_metal',
  armazenamento: 'disponivel',
  pessoa: 'inativos',
  [TABELA_GERAL]: 'saldo',
};

const MASCARA_NUM = (v) =>
  v === null || v === undefined || v === '' || Number.isNaN(Number(v))
    ? '--'
    : Number(v).toLocaleString('pt-BR');

const MASCARA_MOEDA = (v) =>
  v === null || v === undefined || v === '' || Number.isNaN(Number(v))
    ? '--'
    : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// util: pega elemento por id, aceitando canônico e apelidos
function getEl(prefix, canonicalName) {
  const elCanon = document.getElementById(`${prefix}-${canonicalName}`);
  if (elCanon) return elCanon;
  const alts = REVERSE_ALIAS[canonicalName] || [];
  for (const alt of alts) {
    const el = document.getElementById(`${prefix}-${alt}`);
    if (el) return el;
  }
  return null;
}

// util: pega valor considerando alternativas de nome de campo
function getValor(nomeCard, campoCanon, dados) {
  if (dados[campoCanon] !== undefined) return dados[campoCanon];
  const alts = (CAMPO_ALT_READ[nomeCard] && CAMPO_ALT_READ[nomeCard][campoCanon]) || [];
  for (const alt of alts) {
    if (dados[alt] !== undefined) return dados[alt];
  }
  return undefined;
}

// monta (ou atualiza) os detalhes com rótulos fixos + spans de valor
function renderDetalhes(nome, campos, dados) {
  const el = getEl('detalhes', nome);
  if (!el) return;

  const jaTemSpans = el.querySelector('span[data-campo]');
  if (jaTemSpans) {
    campos.forEach((campo) => {
      const span = el.querySelector(`span[data-campo="${campo}"]`);
      const val = getValor(nome, campo, dados);
      if (span) span.textContent = MASCARA_NUM(val);
    });
    return;
  }

  const labels = ROTULOS[nome] || {};
  el.innerHTML = campos
    .map((c) => {
      const val = getValor(nome, c, dados);
      return `${labels[c] || c}: <span class="valor" data-card="${nome}" data-campo="${c}">${MASCARA_NUM(val)}</span>`;
    })
    .join(' <br> ');
}

function renderPreco(nome, dados) {
  const el = getEl('preco', nome);
  if (!el) return;
  const chave = CHAVE_PRECO[nome];
  const base = getValor(nome, chave, dados);
  el.textContent = `R$: ${MASCARA_MOEDA(base)}`;
}

function prefillForm(campos, nome, dados) {
  campos.forEach((campo) => {
    const input = document.getElementById(`${campo}_${nome}`) || document.getElementById(campo);
    if (input) input.value = getValor(nome, campo, dados) ?? '';
  });
}

// atualiza DOM do card sem reload
function atualizaCardDOM(nome, dados) {
  const objCard = CARDS.find((c) => c.nome === nome);
  if (!objCard) return;
  renderDetalhes(nome, objCard.campos, dados);
  renderPreco(nome, dados);
}

// ===== abrir/fechar modal (mantém seus onclick) =====
function mostrarFormulario(id) {
  const forms = document.querySelectorAll('.form-container form');
  forms.forEach((form) => (form.style.display = 'none'));
  const cont = document.querySelector('.form-container');
  if (cont) cont.style.display = 'flex';
  const el = document.getElementById(id);
  if (el) el.style.display = 'grid';
}
function fecharFormulario() {
  const cont = document.querySelector('.form-container');
  if (cont) cont.style.display = 'none';
  const forms = document.querySelectorAll('.form-container form');
  forms.forEach((form) => (form.style.display = 'none'));
}
window.mostrarFormulario = mostrarFormulario;
window.fecharFormulario = fecharFormulario;

// ===== boot =====
window.addEventListener('DOMContentLoaded', async () => {
  // fecha modal ao clicar fora
  const container = document.querySelector('.form-container');
  if (container) {
    container.addEventListener('click', (e) => {
      if (e.target === container) fecharFormulario();
    });
  }

  // carrega último registro de cada tabela e preenche os cards
  for (const { nome, campos } of CARDS) {
    const { data, error } = await supabase
      .from(nome)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error || !data || !data.length) continue;

    const dados = data[0];
    renderDetalhes(nome, campos, dados);
    renderPreco(nome, dados);
    prefillForm(campos, nome, dados);
  }

  // submit de todos os formulários
  const formularios = document.querySelectorAll('.form-container form');
  formularios.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // ex.: formSoja -> soja
      let nome = form.id.replace('form', '').toLowerCase();
      // normaliza apelidos de form, se algum dia usar (formPessoal, formArmazenagem, etc)
      nome = NOME_ALIAS[nome] || nome;

      const inputs = form.querySelectorAll('input');
      const payload = { timestamp: new Date().toISOString() };

      inputs.forEach((input) => {
        // ids do tipo: estoqueatual_soja / meta_milho / estoque_trigo / estoque_lenha / saldo
        const raw = input.id.replace(`_${nome}`, ''); // tira sufixo do card
        const canonical =
          (CAMPO_ALIAS_FORWARD[nome] && CAMPO_ALIAS_FORWARD[nome][raw]) || raw;

        const num = Number(input.value);
        payload[canonical] = input.value === '' ? null : (Number.isNaN(num) ? input.value : num);
      });

      const { error } = await supabase.from(nome).insert([payload]);

      const msg = form.querySelector('.mensagem');
      if (msg) {
        msg.innerHTML = error
          ? `<span style="color:red;">Erro: ${error.message}</span>`
          : `<span style="color:green;">Salvo com sucesso!</span>`;
      }

      if (!error) {
        atualizaCardDOM(nome, payload); // atualiza o card na hora
        fecharFormulario();
      }
    });
  });
});




