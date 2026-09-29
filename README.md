# Métricas SES-PE — site estático

Painel com sprints, comparativos, dashboard gerencial, evolução, esforço, horas e ordens de serviço. Todos os cálculos rodam no navegador, sem banco, API, funções de servidor ou senha. Os dados publicados são acessíveis a quem tiver o endereço, conforme autorização da responsável.

## Vercel

Importe este repositório, preset Other e comando `npm run build`. A configuração está em `vercel.json`. Não precisa de variáveis de ambiente; as senhas da versão anterior podem ser removidas.

## Prévia

Node 22 ou superior. `npm start` abre a prévia em http://127.0.0.1:4175. `npm run build` e `npm test` verificam a saída e os cálculos.

## Atualização

Veja [AUTOMACAO.md](AUTOMACAO.md). A integração com Make será conectada depois.
