function mostrarFormulario(id) {
  const forms = document.querySelectorAll('.form-container form');
  forms.forEach(form => form.style.display = 'none');
  document.querySelector('.form-container').style.display = 'flex';
  document.getElementById(id).style.display = 'block';
}

function fecharFormulario() {
  document.querySelector('.form-container').style.display = 'none';
  const forms = document.querySelectorAll('.form-container form');
  forms.forEach(form => form.style.display = 'none');
}

document.querySelector('.form-container').addEventListener('click', function(e) {
  if (e.target === this) fecharFormulario();
});

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dylziaqkyavkfwjepqkp.supabase.co',
  'SUA-CHAVE'
);

window.addEventListener('DOMContentLoaded', async () => {
  const cards = [
    { nome: 'soja', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'milho', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'trigo', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'lenha', campos: ['estoqueatual', 'meta', 'recebimento', 'percentual_metal'] },
    { nome: 'armazenamento', campos: ['capacidade_total', 'utilizado', 'disponivel'] },
    { nome: 'pessoa', campos: ['total_funcionarios', 'ativos', 'inativos'] },
    { nome: 'geral', campos: ['estoque_total', 'entrada', 'saida', 'saldo'] },
  ];

  for (const { nome, campos } of cards) {
    const { data, error } = await supabase.from(nome).select('*').order('timestamp', { ascending: false }).limit(1);
    if (error) continue;
    if (!data || data.length === 0) continue;
    const dados = data[0];
    const detalhes = campos.map(c => `${c.replace('_', ' ')}: ${dados[c] ?? '--'}`).join(' <br> ');
    const preco = dados.percentual_metal || dados.saldo || dados.disponivel || dados.inativos || '--';
    document.getElementById(`detalhes-${nome}`).innerHTML = detalhes;
    document.getElementById(`preco-${nome}`).innerText = `R$: ${parseFloat(preco).toFixed(2)}`;

    campos.forEach(campo => {
      const input = document.getElementById(`${campo}_${nome}`) || document.getElementById(campo);
      if (input) input.value = dados[campo] ?? '';
    });
  }
});

const formularios = document.querySelectorAll('form');
formularios.forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = form.id.replace('form', '').toLowerCase();
    const inputs = form.querySelectorAll('input');
    const dados = { timestamp: new Date().toISOString() };
    inputs.forEach(input => dados[input.id.replace(`_${id}`, '')] = parseFloat(input.value));

    const { error } = await supabase.from(id).insert([dados]);
    const msg = form.querySelector('.mensagem');
    msg.innerHTML = error ? `<span style='color:red;'>Erro: ${error.message}</span>` : `<span style='color:green;'>Salvo com sucesso!</span>`;
    if (!error) {
      fecharFormulario();
      location.reload();
    }
  });
});
