const produtos = [
    { id: 1, nome: 'Café Expresso', preco: 5.0 },
    { id: 2, nome: 'Cappuccino', preco: 7.5 },
    { id: 3, nome: 'Bolo de Chocolate', preco: 8.0 },
    { id: 4, nome: 'Sanduíche Natural', preco: 12.0 },
];

const pedido = {};

const menuDiv = document.getElementById('menu');
const erroMesaDiv = document.getElementById('erro-mesa');
const resumoPedido = document.getElementById('resumo-pedido');

function criarItem(produto) {
    const div = document.createElement('div');
    div.className = 'item-row';

    const nomeSpan = document.createElement('span');
    nomeSpan.textContent = produto.nome;

    const precoSpan = document.createElement('span');
    precoSpan.textContent = `R$ ${produto.preco.toFixed(2)}`;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'qty-controls';

    const btnMinus = document.createElement('button');
    btnMinus.className = 'btn btn-outline-secondary btn-sm';
    btnMinus.textContent = '-';
    btnMinus.setAttribute('aria-label', `Diminuir quantidade de ${produto.nome}`);
    btnMinus.onclick = () => ajustarQuantidade(produto.id, -1);

    const qtySpan = document.createElement('span');
    qtySpan.className = 'qty-display';
    qtySpan.id = `qty-${produto.id}`;
    qtySpan.setAttribute('aria-live', 'polite');
    qtySpan.textContent = '0';

    const btnPlus = document.createElement('button');
    btnPlus.className = 'btn btn-outline-secondary btn-sm';
    btnPlus.textContent = '+';
    btnPlus.setAttribute('aria-label', `Aumentar quantidade de ${produto.nome}`);
    btnPlus.onclick = () => ajustarQuantidade(produto.id, 1);

    controlsDiv.appendChild(btnMinus);
    controlsDiv.appendChild(qtySpan);
    controlsDiv.appendChild(btnPlus);

    div.appendChild(nomeSpan);
    div.appendChild(precoSpan);
    div.appendChild(controlsDiv);

    return div;
}

function ajustarQuantidade(id, delta) {
    const current = pedido[id] || 0;
    let novaQtd = current + delta;
    if (novaQtd < 0) novaQtd = 0;
    pedido[id] = novaQtd;
    document.getElementById(`qty-${id}`).textContent = novaQtd;
    limparResumo();
}

function validarMesa() {
    const mesa = document.getElementById('mesa').value.trim();
    if (!mesa) {
        erroMesaDiv.style.display = 'block';
        return false;
    }
    erroMesaDiv.style.display = 'none';
    return true;
}

function montarResumo() {
    const mesa = document.getElementById('mesa').value.trim();
    const itensSelecionados = Object.entries(pedido)
        .filter(([_, qtd]) => qtd > 0)
        .map(([id, qtd]) => {
            const produto = produtos.find(p => p.id === +id);
            return `<li>${produto.nome} x${qtd} = R$ ${(produto.preco * qtd).toFixed(2)}</li>`;
        });

    if (itensSelecionados.length === 0) {
        resumoPedido.classList.remove('show');
        resumoPedido.innerHTML = '';
        return false;
    }

    const total = itensSelecionados.reduce((acc, item) => {
        const valor = parseFloat(item.match(/R\$ ([\d.,]+)/)[1].replace(',', '.'));
        return acc + valor;
    }, 0);

    resumoPedido.innerHTML = `
    <h4>Pedido para mesa ${mesa}:</h4>
    <ul>${itensSelecionados.join('')}</ul>
    <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
  `;
    resumoPedido.classList.add('show');
    return true;
}

function limparResumo() {
    resumoPedido.classList.remove('show');
    resumoPedido.innerHTML = '';
}

function finalizarPedido() {
    const mesaValida = validarMesa();
    const temItens = montarResumo();

    if (!mesaValida) return;
    if (!temItens) {
        alert('Selecione ao menos um item para fazer o pedido.');
        return;
    }

    // Salva no localStorage
    const mesa = document.getElementById('mesa').value.trim();
    localStorage.setItem("ultimoPedido", JSON.stringify({ mesa, pedido }));

    alert('Pedido enviado com sucesso!');

    for (const id in pedido) {
        pedido[id] = 0;
        document.getElementById(`qty-${id}`).textContent = '0';
    }
    document.getElementById('mesa').value = '';
    limparResumo();
}

produtos.forEach(produto => {
    menuDiv.appendChild(criarItem(produto));
});

document.getElementById('finalizar').onclick = finalizarPedido;

document.getElementById('mesa').addEventListener('input', () => {
    if (document.getElementById('mesa').value.trim() !== '') {
        erroMesaDiv.style.display = 'none';
    }
    montarResumo();
});

// Carrega pedido anterior
window.onload = () => {
    const ultimo = localStorage.getItem("ultimoPedido");
    if (ultimo) {
        const dados = JSON.parse(ultimo);
        alert(`💡 Último pedido feito na mesa ${dados.mesa} foi recuperado automaticamente.`);
    }
};
