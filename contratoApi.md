# 📘 Contrato de API — FoodShareTech

Este contrato define os endpoints, métodos, payloads e respostas da API desenvolvida para o sistema FoodShareTech.

Observação: Todos os endpoints devem ser consumidos utilizando o Content-Type: application/json, exceto se indicado o uso de formulário HTML.
---

## 🔐 Autenticação e Cadastro

### ✅ Cadastro de Usuário (ONG ou Doador)

- **Endpoint:** `POST /api/cadastro`
- **Descrição:** Realiza o cadastro de um novo usuário no sistema, incluindo endereço e contatos.

#### 📤 Requisição (application/json)

```json
{
 "nome": "@nomeUsuario",
 "email": "@email@exemplo.com",
 "senha": "@senhaSegura123",
 "tipo": "@Doador | @ONG",
 "cnpjCpf": "@12345678900",
 "endereco": {
   "estado": "@SP",
   "cidade": "@São Paulo",
   "bairro": "@Centro",
   "logradouro": "@Rua das Flores",
   "numero": "@123"
 },
 "contatos": ["@11987654321", "@11999998888"]
}
````

#### ✅ Respostas

```json
{
 "success": true,
 "message": "Cadastro de Doador realizado com sucesso."
}
```

```json
{
 "success": false,
 "message": "Campos obrigatórios ausentes."
}
```

### 🔑 Login de Usuário

  - **Endpoint:** `POST /api/login`
  - **Descrição:** Autentica um usuário pelo e-mail e senha.

#### 📤 Requisição

```json
{
 "email": "@email@exemplo.com",
 "senha": "@senhaSegura123"
}
```

#### ✅ Respostas

```json
{
 "success": true,
 "usuario": {
   "id_usuario": 1,
   "nome": "@nomeUsuario",
   "email": "@email@exemplo.com",
   "tipo": "@Doador | @ONG"
 }
}
```

```json
{
 "success": false,
 "message": "Email ou senha inválidos."
}
```

## 👤 Perfil do Usuário

### 🔍 Visualizar Perfil

  - **Endpoint:** `GET /api/usuarios/me`
  - **Descrição:** Retorna os dados completos do usuário logado (identificado via token/sessão, mas no exemplo via query `?idOng=1`).

#### ✅ Respostas

```json
{
 "success": true,
 "usuario": {
   "id_usuario": 1,
   "nome": "@nomeUsuario",
   "email": "@email@exemplo.com",
   "tipo": "@Doador | @ONG",
   "data_cadastro": "@2025-07-02"
 },
 "endereco": {
   "estado": "@SP",
   "cidade": "@São Paulo",
   "bairro": "@Centro",
   "logradouro": "@Rua das Flores",
   "numero": "@123"
 },
 "contatos": [
    { "id_contato": 1, "telefone": "@11987654321" }
 ]
}
```

### ✏️ Atualizar Perfil

  - **Endpoint:** `PUT /api/usuarios/me`
  - **Descrição:** Atualiza informações do usuário logado.

#### 📤 Requisição

```json
{
 "nome": "@novoNomeUsuario",
 "email": "@novoEmail@exemplo.com",
 "endereco": {
   "estado": "@SP",
   "cidade": "@Santos",
   "bairro": "@Boqueirão",
   "logradouro": "@Av. da Praia",
   "numero": "@999"
 },
 "contatos": ["@11912345678", "@11922223333"]
}
```

#### ✅ Resposta

```json
{
 "success": true,
 "message": "Informações atualizadas com sucesso!"
}
```

### 🗑️ Deletar Conta

  - **Endpoint:** `DELETE /api/usuarios/me`
  - **Descrição:** Remove o usuário logado e seus dados associados.

#### ✅ Resposta

```json
{
 "success": true,
 "message": "Conta excluída com sucesso."
}
```

-----

## 🤝 ONGs e Reivindicações

### ✋ Fazer Reivindicação (Dar Lance)

  - **Endpoint:** `POST /api/reivindicacoes`
  - **Descrição:** Permite que uma ONG registrada faça um lance para reivindicar uma doação disponível.

#### 📤 Requisição (application/json)

```json
{
  "idOng": 1,
  "idDoacao": 5
}
```

#### ✅ Respostas

```json
{
  "success": true,
  "message": "Reivindicação realizada com sucesso!",
  "idReivindicacao": 12
}
```

```json
{
  "success": false,
  "message": "ID da ONG e ID da Doação são obrigatórios."
}
```

### 📋 Visualizar Histórico de Reivindicações da ONG

  - **Endpoint:** `GET /api/ong/reivindicacoes`
  - **Descrição:** Retorna uma lista de todas as reivindicações (lances) que uma ONG específica já fez. O ID da ONG deve ser passado como um parâmetro na URL.
  - **Exemplo de URL:** `/api/ong/reivindicacoes?idOng=1`

#### 📤 Requisição

  - **Parâmetros de URL:**
      - `idOng` (obrigatório): O ID da ONG cujo histórico será consultado.

#### ✅ Respostas

```json
{
  "success": true,
  "reivindicacoes": [
    {
      "idReivindicacao": 12,
      "statusReivindicacao": "Pendente",
      "dataReivindicacao": "2025-07-02T05:30:00.000Z",
      "prioridadeCalculada": 85.5,
      "idDoacao": 5,
      "statusDoacao": "Disponível",
      "nomeAlimento": "Arroz Integral 5kg"
    },
    {
      "idReivindicacao": 8,
      "statusReivindicacao": "Concluída",
      "dataReivindicacao": "2025-06-28T18:00:00.000Z",
      "prioridadeCalculada": 92.0,
      "idDoacao": 2,
      "statusDoacao": "Coletada",
      "nomeAlimento": "Leite em Pó 400g"
    }
  ]
}
```

```json
{
  "success": false,
  "message": "O ID da ONG é obrigatório na query string."
}
```

### ✅ Confirmar Coleta da Doação

  - **Endpoint:** `POST /api/reivindicacoes/:id/confirmar`
  - **Descrição:** Confirma que a doação referente a uma reivindicação vencedora foi coletada pela ONG. O `:id` na URL deve ser o ID da **reivindicação**.
  - **Exemplo de URL:** `/api/reivindicacoes/12/confirmar`

#### 📤 Requisição

  - **Parâmetros de URL:**
      - `:id` (obrigatório): O ID da reivindicação que venceu a disputa.
  - **Corpo da Requisição:** Vazio.

#### ✅ Respostas

```json
{
  "success": true,
  "message": "Coleta da doação confirmada com sucesso!"
}
```

```json
{
  "success": false,
  "message": "Reivindicação não encontrada."
}
```

-----

## ⭐ Avaliações

### 📝 Registrar Avaliação de uma ONG

  - **Endpoint:** `POST /api/avaliacoes`
  - **Descrição:** Permite que um Doador envie uma avaliação (nota e comentário) para uma ONG após a coleta de uma doação.

#### 📤 Requisição (application/json)

```json
{
  "idDoador": 1,
  "idOng": 3,
  "nota": 5,
  "comentario": "Processo de coleta muito organizado e equipe atenciosa."
}
```

#### ✅ Respostas

```json
{
  "success": true,
  "message": "Avaliação registrada com sucesso!",
  "idAvaliacao": 25
}
```

```json
{
  "success": false,
  "message": "ID do Doador, ID da ONG e a nota são obrigatórios."
}
```

-----

## 📊 Relatórios

### 📈 Gerar Relatório de Histórico

  - **Endpoint:** `GET /api/relatorios`
  - **Descrição:** Retorna um relatório de histórico para um Doador ou uma ONG, dependendo dos parâmetros enviados na URL.

#### 📤 Requisição

  - **Parâmetros de URL:**
      - `tipo` (obrigatório): O tipo de usuário para o relatório. Valores possíveis: `Doador` ou `ONG`.
      - `id` (obrigatório): O ID do Doador ou da ONG.
  - **Exemplo para Doador:** `/api/relatorios?tipo=Doador&id=1`
  - **Exemplo para ONG:** `/api/relatorios?tipo=ONG&id=3`

#### ✅ Respostas

**Exemplo de Resposta para Doador:**

```json
{
    "success": true,
    "relatorio": [
        {
            "idDoacao": 5,
            "dataDoacao": "2025-07-01T03:00:00.000Z",
            "quantidadeDoacao": 100,
            "statusDoacao": "Coletada",
            "validade": "2025-12-31T03:00:00.000Z",
            "nomeAlimento": "Arroz Integral 5kg",
            "categoria": "Grãos"
        }
    ]
}
```

**Exemplo de Resposta para ONG:**

```json
{
    "success": true,
    "relatorio": [
        {
            "idReivindicacao": 12,
            "dataReivindicacao": "2025-07-02T06:45:00.000Z",
            "statusReivindicacao": "Concluída",
            "idDoacao": 5,
            "statusDoacao": "Coletada",
            "nomeAlimento": "Arroz Integral 5kg",
            "nomeDoador": "Supermercado Exemplo"
        }
    ]
}
```

**Exemplo de Resposta de Erro:**

```json
{
    "success": false,
    "message": "O tipo (Doador ou ONG) e o ID são obrigatórios."
}
```