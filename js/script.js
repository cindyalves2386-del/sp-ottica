// Inicia menu, carrinho e formulário
window.addEventListener("DOMContentLoaded", function () {
    menuResponsivo();
    botoesProdutos();
    paginaCarrinho();
    formularioContato();
    atualizarContador();
});

function $(id) {
    return document.getElementById(id);
}

// Menu hambúrguer
function menuResponsivo() {
    const botao = $("menu-botao");
    const menu = $("menu");
    if (!botao || !menu) return;

    botao.addEventListener("click", function () {
        menu.classList.toggle("ativo");
    });
}

// Carrinho no localStorage
function buscarCarrinho() {
    return JSON.parse(localStorage.getItem("spOtticaCarrinho")) || [];
}

function salvarCarrinho(carrinho) {
    localStorage.setItem("spOtticaCarrinho", JSON.stringify(carrinho));
    atualizarContador();
}

function botoesProdutos() {
    document.querySelectorAll(".btn-carrinho").forEach(function (botao) {
        botao.addEventListener("click", function () {
            const carrinho = buscarCarrinho();
            const nome = botao.dataset.nome;
            const item = carrinho.find(function (produto) {
                return produto.nome === nome;
            });

            if (item) {
                item.quantidade++;
            } else {
                carrinho.push({ nome: nome, preco: Number(botao.dataset.preco), quantidade: 1 });
            }

            salvarCarrinho(carrinho);
            mensagem("mensagem-carrinho", "Produto adicionado ao carrinho.", true);
        });
    });
}

function totais(carrinho) {
    let quantidade = 0;
    let total = 0;

    carrinho.forEach(function (item) {
        quantidade += item.quantidade;
        total += item.preco * item.quantidade;
    });

    return { quantidade: quantidade, total: total };
}

function moeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarContador() {
    if ($("contador-carrinho")) {
        $("contador-carrinho").textContent = totais(buscarCarrinho()).quantidade;
    }
}

// Página do carrinho
function paginaCarrinho() {
    if (!$('lista-carrinho')) return;

    montarCarrinho();
    $("finalizar-compra").addEventListener("click", finalizarCompra);
    $("limpar-carrinho").addEventListener("click", limparCarrinho);
}

function montarCarrinho() {
    const carrinho = buscarCarrinho();
    const resumo = totais(carrinho);

    if (carrinho.length === 0) {
        $("lista-carrinho").innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
    } else {
        $("lista-carrinho").innerHTML = carrinho.map(function (item) {
            return '<article class="item-carrinho"><div><h2>' + item.nome + '</h2><p>Quantidade: ' + item.quantidade + '</p></div><strong>' + moeda(item.preco * item.quantidade) + '</strong></article>';
        }).join("");
    }

    $("quantidade-total").textContent = resumo.quantidade;
    $("valor-total").textContent = moeda(resumo.total);
    atualizarContador();
}

function finalizarCompra() {
    if (buscarCarrinho().length === 0) {
        mensagem("mensagem-carrinho", "Adicione um produto antes de finalizar.", false);
        return;
    }

    const pagamento = document.querySelector('input[name="pagamento"]:checked').value;
    localStorage.removeItem("spOtticaCarrinho");
    montarCarrinho();
    mensagem("mensagem-carrinho", "Compra finalizada com sucesso! Pagamento: " + pagamento + ".", false);
}

function limparCarrinho() {
    localStorage.removeItem("spOtticaCarrinho");
    montarCarrinho();
    mensagem("mensagem-carrinho", "Carrinho limpo.", true);
}

// Validação do formulário
function formularioContato() {
    const form = $("form-contato");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        limparErros();

        const nome = $("nome").value.trim();
        const email = $("email").value.trim();
        const telefone = $("telefone").value.trim();
        const texto = $("mensagem").value.trim();
        let valido = true;

        if (nome === "") valido = erro("nome", "Nome obrigatório.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) valido = erro("email", "Email inválido.");
        if (telefone === "") valido = erro("telefone", "Telefone obrigatório.");
        if (texto.length < 10) valido = erro("mensagem", "Mensagem mínima de 10 caracteres.");

        if (valido) {
            form.reset();
            mensagem("mensagem-contato", "Mensagem enviada com sucesso.", false);
        }
    });
}

function limparErros() {
    ["nome", "email", "telefone", "mensagem"].forEach(function (campo) {
        if ($("erro-" + campo)) $("erro-" + campo).textContent = "";
    });
}

function erro(campo, texto) {
    $("erro-" + campo).textContent = texto;
    return false;
}

function mensagem(id, texto, apagar) {
    const elemento = $(id);
    if (!elemento) return;

    elemento.textContent = texto;

    if (id === "mensagem-carrinho") {
        elemento.classList.add("aviso");
    }

    if (apagar) {
        setTimeout(function () {
            elemento.textContent = "";
            elemento.classList.remove("aviso");
        }, 3000);
    }
}