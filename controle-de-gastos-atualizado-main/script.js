
const formulario = document.getElementById('formulario');

const campoDescricao = document.getElementById('descricao');
const campoValor = document.getElementById('valor');
const campoCategoria = document.getElementById('categoria');

const botaoRemover = document.getElementById('remover');
const filtro = document.getElementById('filtro');
const ordenacao = document.getElementById('ordenacao');

const telaTotal = document.getElementById('total');
const telaQuantidade = document.getElementById('quantidade');
const telaMedia = document.getElementById('media');
const telaMaior = document.getElementById('maior');
const telaMenor = document.getElementById('menor');
const telaOrcamento = document.getElementById('orcamento');

const telaLinhas = document.getElementById('linhas');
const telaTotalRodape = document.getElementById('total-rodape');
const telaCategorias = document.getElementById('lista-categorias');
const telaLegenda = document.getElementById('legenda');

const orcamentoInicial = 120;

let gastos = [];
let proximoId = 1;

function formatarReais(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function gerarClasseCategoria(nome) {
    return nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function calcularSoma(lista) {
    let soma = 0;

    for (let i = 0; i < lista.length; i++) {
        soma += lista[i].valor;
    }

    return soma;
}


// Calcula a média dos gastos
function calcularMedia(soma, quantidade) {
    if (quantidade === 0) {
        return 0;
    }

    return soma / quantidade;
}


// Encontra o maior gasto
function encontrarMaiorGasto(lista) {
    let maior = lista[0];

    for (let i = 1; i < lista.length; i++) {
        if (lista[i].valor > maior.valor) {
            maior = lista[i];
        }
    }

    return maior;
}


// Encontra o menor gasto
function encontrarMenorGasto(lista) {
    let menor = lista[0];

    for (let i = 1; i < lista.length; i++) {
        if (lista[i].valor < menor.valor) {
            menor = lista[i];
        }
    }

    return menor;
}

function ordenar(lista, ordem) {
    const copia = [...lista];

    if (ordem === 'titulo-az') {
        return copia.sort((a, b) =>
            a.descricao.localeCompare(b.descricao, 'pt-BR')
        );
    }

    if (ordem === 'titulo-za') {
        return copia.sort((a, b) =>
            b.descricao.localeCompare(a.descricao, 'pt-BR')
        );
    }

    return copia;
}

function atualizarResumo() {
    const soma = calcularSoma(gastos);
    const quantidade = gastos.length;
    const media = calcularMedia(soma, quantidade);

    telaTotal.textContent = formatarReais(soma);
    telaQuantidade.textContent = quantidade;
    telaMedia.textContent = formatarReais(media);

    if (quantidade === 0) {
        telaMaior.textContent = '—';
        telaMenor.textContent = '—';
    } else {
        const maior = encontrarMaiorGasto(gastos);
        const menor = encontrarMenorGasto(gastos);

        telaMaior.textContent =
            maior.descricao + ' — ' + formatarReais(maior.valor);

        telaMenor.textContent =
            menor.descricao + ' — ' + formatarReais(menor.valor);
    }

    const restante = orcamentoInicial - soma;

    if (restante >= 0) {
        telaOrcamento.textContent =
            formatarReais(restante) + ' restantes';

        telaOrcamento.style.color = '#267b45';
    } else {
        telaOrcamento.textContent =
            formatarReais(Math.abs(restante)) +
            ' acima do orçamento';

        telaOrcamento.style.color = '#c0392b';
    }
}

function atualizarCategorias() {
    telaCategorias.innerHTML = '';

    const somaTotal = calcularSoma(gastos);

    const categorias = [
        'Alimentação',
        'Transporte',
        'Lazer'
    ];

    for (let i = 0; i < categorias.length; i++) {
        const nomeCategoria = categorias[i];
        let somaCategoria = 0;

        for (let j = 0; j < gastos.length; j++) {
            if (gastos[j].categoria === nomeCategoria) {
                somaCategoria += gastos[j].valor;
            }
        }

        let porcentagem = 0;

        if (somaTotal > 0) {
            porcentagem = (somaCategoria / somaTotal) * 100;
        }

        const classe = gerarClasseCategoria(nomeCategoria);

        const item = document.createElement('div');
        item.className = 'categoria';

        const titulo = document.createElement('div');
        titulo.className = 'categoria-titulo';

        const nome = document.createElement('span');
        nome.textContent = nomeCategoria;

        const valor = document.createElement('strong');
        valor.textContent =
            formatarReais(somaCategoria) +
            ' (' + Math.round(porcentagem) + '%)';

        titulo.appendChild(nome);
        titulo.appendChild(valor);

        const barraFundo = document.createElement('div');
        barraFundo.className = 'barra-fundo';

        const barra = document.createElement('div');
        barra.className = 'barra ' + classe;
        barra.style.width = porcentagem + '%';

        barraFundo.appendChild(barra);

        item.appendChild(titulo);
        item.appendChild(barraFundo);

        telaCategorias.appendChild(item);
    }
}

function atualizarTabela() {
    telaLinhas.innerHTML = '';

    const gastosFiltrados = gastos.filter(function(gasto) {
        return filtro.value === 'Todas' ||
            gasto.categoria === filtro.value;
    });

    const gastosOrdenados = ordenar(
        gastosFiltrados,
        ordenacao.value
    );

    for (let i = 0; i < gastosOrdenados.length; i++) {
        const gasto = gastosOrdenados[i];

        const linha = document.createElement('tr');

        const colunaNumero = document.createElement('td');
        colunaNumero.textContent = i + 1;

        const colunaDescricao = document.createElement('td');
        colunaDescricao.textContent = gasto.descricao;

        const colunaValor = document.createElement('td');
        colunaValor.textContent = formatarReais(gasto.valor);

        const colunaCategoria = document.createElement('td');
        const etiqueta = document.createElement('span');

        const classe = gerarClasseCategoria(gasto.categoria);

        etiqueta.className = 'etiqueta ' + classe;
        etiqueta.textContent = gasto.categoria;

        colunaCategoria.appendChild(etiqueta);

        const colunaApagar = document.createElement('td');
        const botaoApagar = document.createElement('button');

        botaoApagar.type = 'button';
        botaoApagar.className = 'apagar';
        botaoApagar.textContent = '×';

        botaoApagar.setAttribute(
            'aria-label',
            'Apagar gasto: ' + gasto.descricao
        );

        botaoApagar.addEventListener('click', function() {
            gastos = gastos.filter(function(item) {
                return item.id !== gasto.id;
            });

            atualizarTela();
        });

        colunaApagar.appendChild(botaoApagar);

        linha.appendChild(colunaNumero);
        linha.appendChild(colunaDescricao);
        linha.appendChild(colunaValor);
        linha.appendChild(colunaCategoria);
        linha.appendChild(colunaApagar);

        telaLinhas.appendChild(linha);
    }

    const somaFiltrada = calcularSoma(gastosOrdenados);

    telaTotalRodape.textContent = formatarReais(somaFiltrada);

    if (gastosOrdenados.length === 0) {
        telaLegenda.textContent = 'Nenhum gasto';
    } else {
        telaLegenda.textContent =
            gastosOrdenados.length +
            (gastosOrdenados.length === 1
                ? ' gasto'
                : ' gastos');
    }
}

function atualizarTela() {
    atualizarResumo();
    atualizarCategorias();
    atualizarTabela();

    botaoRemover.disabled = gastos.length === 0;
}


// Adiciona um novo gasto
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();

    const nome = campoDescricao.value.trim();
    const valorGasto = Number(campoValor.value);
    const categoriaGasto = campoCategoria.value;

    if (
        nome === '' ||
        !Number.isFinite(valorGasto) ||
        valorGasto <= 0
    ) {
        return;
    }

    const novoGasto = {
        id: proximoId,
        descricao: nome,
        valor: valorGasto,
        categoria: categoriaGasto
    };

    proximoId++;

    gastos.push(novoGasto);

    formulario.reset();

    atualizarTela();

    campoDescricao.focus();
});


// Remove o último gasto adicionado
botaoRemover.addEventListener('click', function() {
    if (gastos.length === 0) {
        return;
    }

    gastos.pop();

    atualizarTela();
});


filtro.addEventListener('change', function() {
    atualizarTabela();
});

ordenacao.addEventListener('change', function() {
    atualizarTabela();
});

atualizarTela();
