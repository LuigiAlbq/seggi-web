# seggi-web

Painel web do **Seggi**, o sistema de controle de estoque e distribuição. Consome a API REST do
[seggi-app](../seggi-app) (Spring Boot), cujo contrato fica em
`seggi-app/src/main/resources/openapi/api-spec.yaml`.

**Escopo atual (MVP):** Categorias, Produtos, Armazéns e Estoque, além de um painel inicial com a
ocupação dos armazéns.

## Stack

| Camada            | Escolha                                                          |
| ----------------- | ---------------------------------------------------------------- |
| Framework         | Angular 22: standalone, signals, zoneless, `rxResource`           |
| UI                | PrimeNG 22 (tema Aura) + Tailwind CSS 4 (`tailwindcss-primeui`)  |
| Cliente da API    | OpenAPI Generator (`typescript-angular`), gerado do contrato     |
| Formulários       | Reactive Forms tipados                                           |
| Testes            | Vitest (unidade) e Playwright (e2e)                              |
| Qualidade         | ESLint (angular-eslint) e Prettier                               |

## Pré-requisitos

- **Node 24** (ou 22.22.3 ou superior). Veja `.nvmrc`.
- **Java 21**, usado apenas pelo `npm run api:generate`.
- O **seggi-app** rodando em `http://localhost:8080`, para usar o app com dados reais.

## Como rodar

```bash
npm install
npm start            # http://localhost:4200
```

Em desenvolvimento, o `proxy.conf.json` encaminha `/api` para `http://localhost:8080`. Por isso não
é preciso configurar CORS no backend.

Para subir o backend, a partir da pasta `seggi-app`:

```bash
docker compose up -d     # PostgreSQL 16
mvn spring-boot:run
```

## Scripts

| Comando                | O que faz                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| `npm start`            | Servidor de desenvolvimento, com proxy para a API                |
| `npm run build`        | Build de produção em `dist/seggi-web`                            |
| `npm test`             | Testes unitários (Vitest)                                        |
| `npm run e2e`          | Testes e2e (Playwright) com uma API falsa em memória             |
| `npm run lint`         | ESLint                                                           |
| `npm run format`       | Prettier                                                         |
| `npm run api:generate` | Regenera o cliente da API a partir do `api-spec.yaml` do backend |

Na primeira execução do e2e, instale o navegador com `npx playwright install chromium`. Para rodar
o e2e contra o backend real, use `E2E_REAL_API=1 npm run e2e`.

## Estrutura

```
src/app/
  core/
    api/generated/   cliente gerado (não editar; rode npm run api:generate)
    http/            interceptors de erro (toast) e auth (stub para o futuro JWT)
    layout/          shell com sidebar, topbar, toasts e confirmações
  shared/            componentes (page-header, empty-state, capacity-bar...) e utils
  features/
    home/            painel inicial
    categories/      CRUD de categorias
    products/        CRUD de produtos e estoque por armazém
    warehouses/      CRUD de armazéns, estoque e ocupação
```

## Cliente da API

O cliente em `src/app/core/api/generated/` é gerado a partir do contrato do seggi-app e fica
versionado. Assim, o build não depende do repositório do backend. Sempre que o `api-spec.yaml`
mudar, rode:

```bash
npm run api:generate
```

## Particularidades do backend

O front foi escrito para lidar com o comportamento atual do seggi-app:

- **Mutações respondem `text/plain`**, não JSON. O cliente gerado já usa `responseType: 'text'`.
- **Erros** chegam em `text/plain`, no JSON padrão do Spring ou com corpo vazio. O
  `errorInterceptor` transforma tudo isso em toast.
- **Não há paginação nem filtros na API.** Busca, ordenação e paginação são feitas no cliente,
  pelo `p-table`.
- **Ocupação dos armazéns:** não há endpoint agregado, então o front faz 1 + N chamadas
  (`WarehouseOccupancyService`).
- **`Product.weight`** não é persistido pelo backend, por isso o campo não aparece no formulário.
- **Não há autenticação.** O `authInterceptor` é o ponto de extensão para quando houver JWT.

## Licença do PrimeNG

A partir da versão 22, o PrimeNG é distribuído sob a **PrimeUI License**. Ela é gratuita na
Community License (pessoas físicas, estudantes, ONGs e empresas pequenas) e paga para as demais.
Sem uma chave configurada, o app mostra o aviso "Invalid PrimeUI License" no canto da tela. Coloque
a chave em `primeuiLicense`, no arquivo `src/environments/environment.ts`. Veja
https://primeui.dev/licenses.
