# 📘 Contrato de API — FoodShareTech

Este contrato define os endpoints, métodos, payloads e respostas da API desenvolvida para o sistema FoodShareTech.

Observação: Todos os endpoints devem ser consumidos utilizando o Content-Type: application/json, exceto se indicado o uso de formulário HTML.
---

## 🔐 Autenticação e Cadastro

### ✅ Cadastro de Usuário (ONG ou Doador)

- [cite_start]**Endpoint:** `POST /api/cadastro` [cite: 2, 5]
- [cite_start]**Descrição:** Realiza o cadastro de um novo usuário no sistema, incluindo endereço e contatos. [cite: 5]

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

  - [cite\_start]**Endpoint:** `POST /api/login` [cite: 2, 5]
  - [cite\_start]**Descrição:** Autentica um usuário pelo e-mail e senha. [cite: 5]

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

  - [cite\_start]**Endpoint:** `GET /api/usuarios/me` [cite: 5]
  - [cite\_start]**Descrição:** Retorna os dados completos do usuário logado (identificado via token/sessão, mas no exemplo via query `?idOng=1`). [cite: 5]

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

  - [cite\_start]**Endpoint:** `PUT /api/usuarios/me` [cite: 5]
  - [cite\_start]**Descrição:** Atualiza informações do usuário logado. [cite: 5]

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

  - [cite\_start]**Endpoint:** `DELETE /api/usuarios/me` [cite: 5]
  - [cite\_start]**Descrição:** Remove o usuário logado e seus dados associados. [cite: 5]

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

  - [cite\_start]**Endpoint:** `POST /api/reivindicacoes` [cite: 2]
  - [cite\_start]**Descrição:** Permite que uma ONG registrada faça um lance para reivindicar uma doação disponível. [cite: 2]

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

  - [cite\_start]**Endpoint:** `GET /api/ong/reivindicacoes` [cite: 2]
  - **Descrição:** Retorna uma lista de todas as reivindicações (lances) que uma ONG específica já fez. [cite\_start]O ID da ONG deve ser passado como um parâmetro na URL. [cite: 2]
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

  - [cite\_start]**Endpoint:** `POST /api/reivindicacoes/:id/confirmar` [cite: 2]
  - **Descrição:** Confirma que a doação referente a uma reivindicação vencedora foi coletada pela ONG. [cite\_start]O `:id` na URL deve ser o ID da **reivindicação**. [cite: 2]
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


