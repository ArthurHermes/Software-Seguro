# EducaFlix

Frontend inicial da plataforma web de vídeos educacionais **EducaFlix**, com foco em consistência visual, componentes reutilizáveis e base pronta para evolução futura (integração com API e regras de negócio).

## Tecnologias utilizadas

- HTML5
- CSS3 (com Design System em arquivos separados)
- JavaScript ES Modules (Web Components simples para reutilização)
- Google Fonts (`Sora` e `Manrope`)
- Bootstrap Icons (SVG inline)

## Estrutura de pastas

```text
.
├── design-system/
│   ├── base.css
│   ├── components.css
│   └── tokens.css
├── src/
│   ├── components/
│   │   ├── app-button.js
│   │   ├── app-header.js
│   │   └── app-input.js
│   ├── cadastro.js
│   └── main.js
├── cadastro.html
├── index.html
└── README.md
```

## Design System criado

### 1) Tipografia

- Fonte de destaque (`--font-display`): **Sora** (títulos e elementos de maior impacto)
- Fonte de corpo (`--font-body`): **Manrope** (textos, labels e navegação)
- Hierarquia principal:
  - `hero__title`: título principal da home
  - `section-title`: títulos de seções
  - `auth__title`: título da tela de cadastro
  - textos auxiliares em `.section-subtitle`, `.helper-text` e labels

### 2) Paleta de cores

Definida em `design-system/tokens.css` com variáveis CSS:

- Cor principal (base): `--color-primary-500` = `#1D96D5`
- Cor principal (escura): `--color-primary-600` = `#1479AD`
- Cor principal (mais escura): `--color-primary-700` = `#0F5F8A`
- Fundo principal: `--color-bg-main` = `#F5F8FC`
- Fundo de superfície: `--color-bg-surface` = `#FFFFFF`
- Fundo de apoio/acento: `--color-bg-accent` = `#EAF4FF`
- Variação clara da principal: `--color-primary-100` = `#DFF1FB`
- Textos: `--color-text-900` = `#172033`, `--color-text-700` = `#394763`, `--color-text-500` = `#69789B`
- Bordas e estados: `--color-border` = `#D6E2F1`, `--color-success` = `#157347`

### 3) Botões

Componente reutilizável: `<app-button>`

- Primário (`variant="primary"`): CTA principal com gradiente azul e maior destaque
- Secundário (`variant="secondary"`): ação alternativa com fundo claro e borda

### 4) Inputs

Componente reutilizável: `<app-input>`

- Label + campo padronizado
- Estados visuais consistentes de foco
- Aplicado no formulário de cadastro (nome, e-mail, senha, confirmar senha)

### 5) Ícones/símbolos

- Ícones da biblioteca **Bootstrap Icons** em SVG inline
- Usados nos cards da home e no símbolo de play do logo
- Embutidos diretamente no markup para funcionar sem dependência de CDN

## Páginas implementadas

## 1) Tela inicial (`index.html`)

- Header com logo/nome **EducaFlix**
- Navegação com links para **Início** e **Cadastro**
- Hero com título, subtítulo e botão principal (CTA para cadastro)
- Seção com cards de benefícios
- Layout responsivo para desktop e mobile

## 2) Tela de cadastro (`cadastro.html`)

- Título de cadastro
- Formulário visual com:
  - nome
  - e-mail
  - senha
  - confirmar senha
- Botão de cadastrar
- Link/botão para voltar à tela inicial
- Mesmo padrão visual da home

  
## Decisões de design

- **Azul como cor principal**: transmite confiança e clareza, adequado para educação digital.
- **Fundo claro com gradientes suaves**: melhora percepção de profundidade sem poluição visual.
- **Tipografia Sora + Manrope**: combinação moderna com boa legibilidade em desktop e mobile.
- **Componentes Web reutilizáveis** (`app-header`, `app-button`, `app-input`): simplificam manutenção e facilitam escala.


