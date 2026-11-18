# Loja virtual + painel administrativo

- **Loja** (`/`): vitrine, banners de campanha, busca, favoritos, carrinho e pedido que chega no painel e é confirmado pelo WhatsApp.
- **Painel** (`/admin.html`): visão geral de vendas, pedidos (status, venda manual, exportar planilha), produtos (fotos, preço, custo, estoque, importar planilha), campanhas/banners (imagem de computador e celular, datas de início e fim) e configurações (nome, cores, WhatsApp, categorias, backup).

## Rodar no computador
```
npm install
ADMIN_PASSWORD=suasenha npm start
```
Abra http://localhost:3000 e http://localhost:3000/admin.html

## Publicar no Render
1. Suba esta pasta para um repositório no GitHub.
2. No Render: **New → Blueprint** e escolha o repositório (usa o `render.yaml`).
3. Defina a variável **ADMIN_PASSWORD** (a senha do painel).

**Importante sobre os dados:** tudo fica salvo no arquivo `db.json` dentro do disco `/var/data`.
O disco persistente do Render só existe no plano pago (Starter). No plano grátis o site funciona,
mas os produtos e pedidos são apagados a cada reinício/atualização.

Sem servidor (abrindo os arquivos direto), a loja roda em **modo demonstração**: dados salvos só no navegador, senha do painel `admin`.
