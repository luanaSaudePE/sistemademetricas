# Gestão de Projetos SES-PE — versão para Vercel

Sistema de consulta, sem banco de dados, com os dados atuais de `base_metricas.xlsx` e o layout azul da referência. A base original não foi alterada.

## O que está incluído

- Dashboard da sprint, com indicadores, gráficos, busca e tabela paginada.
- Comparativo de até seis sprints e evolução de até seis projetos.
- Dashboard gerencial, faixas de aging e situação dos projetos derivada dos cards.
- Esforço por projeto, atividade e colaborador.
- Horas por colaborador e consulta dos lançamentos.
- Consulta dos itens do tipo Ordem de Serviço, com listagem e detalhe.
- Filtros, exportação CSV e acesso por senha.

## Base inicial

Importada em 29/09/2026 a partir do arquivo local fornecido:

| Conteúdo | Quantidade |
| --- | ---: |
| Linhas em dados-brutos | 5.136 |
| IDs distintos em dados-brutos | 5.125 |
| Cards distintos, excluindo OS | 4.666 |
| Itens do tipo Ordem de Serviço | 459 |
| Apontamentos em tempogasto | 14.146 |
| Registros de aging | 260 |

O último apontamento de horas da base é de **25/09/2026**. A data de importação e a data do último apontamento são informações diferentes e aparecem no painel.

Os dados estão em `data/snapshot.json.gz`, comprimidos e incluídos somente na função do servidor. Eles não ficam disponíveis como arquivo público no site. O envio deste repositório como **público**, incluindo a cópia da base, foi autorizado pelo proprietário. A senha protege o painel, mas os arquivos do repositório público podem ser baixados pelo GitHub.

## Publicar na Vercel

1. Extraia `metricas-vercel.zip`.
2. Use o repositório `luanaSaudePE/sistemademetricas`, que já contém o sistema. O arquivo `package.json` fica na raiz.
3. Na Vercel, abra **Add New → Project** e importe esse repositório.
4. Selecione **Other** em Framework Preset. Use **Node.js 22.x**. O `vercel.json` já define o comando de build e a saída; preserve essas configurações, sem substituir a saída por `public`.
5. Antes de publicar, configure as variáveis abaixo em **Environment Variables**. Inclua Production e Preview se quiser consultar os dados nos dois ambientes.

| Variável | Valor a configurar |
| --- | --- |
| `DASHBOARD_PASSWORD` | Uma senha de acesso escolhida por você, com pelo menos 12 caracteres. |
| `SESSION_SECRET` | Uma chave aleatória com pelo menos 32 caracteres, diferente da senha. |

Para gerar a chave no seu computador:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

6. Clique em **Deploy**. Quando concluir, abra a URL e entre com `DASHBOARD_PASSWORD`.

Sem essas variáveis o sistema bloqueia o acesso aos dados e exibe uma orientação de configuração. Se adicionar ou mudar variáveis depois de publicar, faça um **Redeploy** para aplicá-las. A senha é compartilhada para consulta nesta primeira versão; contas individuais ainda não foram implementadas. A sessão dura oito horas.

O sistema gera um artefato no formato Build Output API da Vercel. Não há dependências externas a instalar para rodar a aplicação: ela usa Node.js, HTML, CSS e JavaScript.

## Abrir no computador

1. Instale Node.js 22 ou superior.
2. Na pasta do sistema, copie `.env.example` para `.env.local` e preencha as duas variáveis de acesso.
3. Abra o terminal nessa pasta e execute:

```sh
npm start
```

No PowerShell, se houver bloqueio de `npm.ps1`, execute `npm.cmd start`.

Abra o endereço informado: `http://127.0.0.1:4174`.

Para conferir o pacote e os testes:

```sh
npm run build
npm test
```

Os arquivos `.env.local`, `.vercel` e `node_modules` ficam fora do repositório pela configuração de `.gitignore`. Não publique a senha ou a chave no código.

## Regras dos indicadores

- **Cards:** IDs distintos no recorte, excluindo itens do tipo `Ordem de Serviço`. Há 11 IDs repetidos entre sprint e backlog. Dentro do recorte, a sprint datada mais recente tem preferência. A cópia da fonte preserva todas as linhas.
- **Concluídos:** status contendo `Concluído` ou igual a `Entregue`. Cancelados não contam como entrega.
- **SP planejados:** soma de storypoints dos cards com `planejado = 1`.
- **SP realizados:** soma de storypoints de todos os cards concluídos no recorte.
- **Taxa de entrega:** SP concluídos dos cards planejados dividido pelos SP dos cards planejados. Por isso a taxa não é simplesmente “SP realizados ÷ SP planejados”.
- **Planejamento vazio:** permanece “Não informado”; não vira “Não planejado”.
- **Cycle time e lead time:** média de `diferenca_transicoes`, ponderada por `quantidade_issues`, nas respectivas abas. A implementação trata o valor da fonte como uma média do grupo. **Confirme essa definição com o gerador da planilha**: se a coluna representar um total de dias, a fórmula precisa mudar para soma dos totais dividida pela quantidade de issues. A unidade não é presumida no painel.
- **Retrabalho e vazão:** valores das abas correspondentes, agregados por squad/sprint.
- **Aging:** faixas existentes na aba aging, associadas aos cards pelo ID. A fonte não fornece os dias exatos; uma média em dias não é estimada.
- **Projetos:** “Com itens abertos” e “Somente finalizados” são classificações calculadas dos cards, não status oficiais de projeto.
- **Horas:** soma de Tempo Gasto em tempogasto. Não há capacidade esperada ou horas contratadas por pessoa nesta base.

## Filtros e limitações da fonte

Os cards não possuem data individual: o filtro de período usa a interseção com o intervalo da sprint. Cards sem sprint datada ficam fora quando se define um período. As horas usam a data do apontamento. Quando se filtra uma sprint, horas são selecionadas por suas datas, sem afirmar um vínculo explícito com a sprint.

Cycle time, lead time, retrabalho e vazão vêm agregados por squad/sprint. Quando o filtro exige projeto, tipo, status ou colaborador, o sistema mostra “—” para essas métricas em vez de atribuir indevidamente o total do squad ao projeto. Apontamentos de horas não possuem status ou tipo de card, então esses filtros tornam as horas indisponíveis no painel.

Os cards não têm responsável na base. O filtro de colaborador é usado nas telas de horas e esforço. Story points por pessoa não são inventados; a tela de sprint apresenta a distribuição por squad.

Os 459 itens de Ordem de Serviço podem ser consultados. Porém a base não fornece número administrativo separado do ID, data de criação da OS, vínculo OS → história, justificativas ou controle do e-mail. As abas correspondentes indicam essa ausência. Nesta versão, não há formulário que simule salvar esses campos.

## Próxima etapa: conectar o Make

**A atualização diária não está ativa nesta entrega.** O botão Atualizar e a consulta automática da tela a cada cinco minutos releem a cópia embutida no servidor; eles não baixam o OneDrive. Até conectar o Make, atualizar os dados exige substituir o snapshot e republicar.

O ponto de entrada reservado é:

```text
POST /api/index?action=import
Authorization: Bearer <IMPORT_SECRET>
```

Por enquanto ele responde que a integração está desativada. Nenhum envio é aceito como atualização bem-sucedida e nenhuma alteração fica apenas na memória da função.

Na próxima etapa, vamos:

1. Conectar o Make à conta Microsoft e selecionar a planilha privada.
2. Criar armazenamento privado de arquivos para guardar a versão válida mais recente.
3. Implementar recebimento do XLSX ou dos dados extraídos, validação de colunas, substituição atômica e leitura dessa versão no servidor.
4. Agendar a importação para 7h15 em America/Sao_Paulo, verificar a data do arquivo e testar a disponibilidade antes de 7h30.
5. Manter a última versão válida se uma atualização falhar, exibindo a data real dos dados.

Não é necessário banco de dados para esse fluxo de consulta. `IMPORT_SECRET` será uma chave separada da senha de acesso, configurada quando ativarmos a integração.

## Verificação realizada

O build local da Vercel e os testes de reconciliação, filtros, métricas, acesso por senha, paginação, detalhes, exportação e separação dos arquivos privados passaram. A navegação foi conferida na prévia local. A publicação em uma conta Vercel ainda precisa ser feita; não há URL de produção nesta entrega.
