import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dylziaqkyavkfwjepqkp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bHppYXFreWF2a2Z3amVwcWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTc1OTgsImV4cCI6MjA2ODAzMzU5OH0.gy5jXxKOTgeCf0Rwq7ktLTz1pyoZ8dJjZOK9UB9rHCM'
);

function mostrarFormulario(id) {
  const forms = document.querySelectorAll('.form-container form');
  forms.forEach(form => form.style.display = 'none');
  const cont = document.querySelector('.form-container');
  if (cont) cont.style.display = 'flex';
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function fecharFormulario() {
  const cont = document.querySelector('.form-container');
  if (cont) cont.style.display = 'none';
  const forms = document.querySelectorAll('.form-container form');
  forms.forEach(form => form.style.display = 'none');
}

// deixa disponível para o HTML (onclick)
window.mostrarFormulario = mostrarFormulario;
window.fecharFormulario = fecharFormulario;

// se sua tabela não for “geral”, troque aqui
const TABELA_GERAL = 'geral';

window.addEventListener('DOMContentLoaded', async () => {
  // fechar ao clicar fora
  const container = document.querySelector('.form-container');
  if (container) {
    container.addEventListener('click', (e) => {
      if (e.target === container) fecharFormulario();
    });
  }

  const cards = [
    { nome: 'soja', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'milho', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'trigo', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'lenha', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'armazenamento', campos: ['capacidade_total', 'utilizado', 'disponivel'] },
    { nome: 'pessoa', campos: ['total_funcionarios', 'ativos', 'inativos'] },
    { nome: TABELA_GERAL, campos: ['estoque_total', 'entrada', 'saida', 'saldo'] },
  ];

  for (const { nome, campos } of cards) {
    const { data, error } = await supabase.from(nome).select('*').order('timestamp', { ascending: false }).limit(1);
    if (error || !data || data.length === 0) continue;

    const dados = data[0];
    const detalhes = campos.map(c => ${c.replace('_', ' ')}: ${dados[c] ?? '--'}).join(' <br> ');
    const precoBase = dados.percentual_metal ?? dados.saldo ?? dados.disponivel ?? dados.inativos ?? '--';
    const preco = isNaN(parseFloat(precoBase)) ? '--' : parseFloat(precoBase).toFixed(2);

    const elDetalhes = document.getElementById(detalhes-${nome});
    const elPreco = document.getElementById(preco-${nome});
    if (elDetalhes) elDetalhes.innerHTML = detalhes;
    if (elPreco) elPreco.innerText = R$: ${preco};

    // preencher campos do formulário com último registro
    campos.forEach(campo => {
      const input = document.getElementById(${campo}_${nome}) || document.getElementById(campo);
      if (input) input.value = dados[campo] ?? '';
    });
  }

  const formularios = document.querySelectorAll('form');
  formularios.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = form.id.replace('form', '').toLowerCase();
      const inputs = form.querySelectorAll('input');
      const payload = { timestamp: new Date().toISOString() };

      inputs.forEach(input => {
        const key = input.id.replace(_${id}, '');
        const num = Number(input.value);
        payload[key] = input.value === '' ? null : (isNaN(num) ? input.value : num);
      });

      const { error } = await supabase.from(id).insert([payload]);
      const msg = form.querySelector('.mensagem');
      if (msg) {
        msg.innerHTML = error
          ? <span style="color:red;">Erro: ${error.message}</span>
          : <span style="color:green;">Salvo com sucesso!</span>;
      }
      if (!error) {
        fecharFormulario();
        location.reload();
      }
    });
  });
});

