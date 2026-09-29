# Atualização automática

O site carrega `/data/snapshot.json`. Os cálculos, filtros e exportações rodam no navegador.

Na futura automação, publique `data/snapshot.json` na branch `main`. A compilação usa esse arquivo quando presente; caso contrário, usa a base inicial `data/snapshot.json.gz`. A automação precisa converter a planilha para o formato JSON abaixo. Enviar o XLSX diretamente não atualiza o painel.

Campos obrigatórios: `metadata`, `items`, `hours`, `aging`, `cycle`, `lead`, `throughput`, `rework`. Registros são arrays na seguinte ordem:

- items: id, título, status, projeto, sprint, tipo, pontos, confiança, planejado (1/0/null), squad, tribo, time.
- hours: id, projeto, história, tarefa, descrição, data ISO, colaborador, atividade, time, squad, tribo, horas.
- aging: squad, id, faixa.
- cycle, lead, throughput, rework: squad, sprint, valor, quantidade.
- metadata: mantenha os campos atuais e atualize importedAt (ISO), lastHoursDate, sourceName e counts.

Com a Vercel conectada ao GitHub, um novo commit dispara uma publicação. O Make poderá executar diariamente após as 7:00, com tempo para conversão e publicação antes das 7:30 (Brasília). A integração e o horário ainda não foram configurados.

O botão Atualizar busca o arquivo novamente. O painel também consulta os dados a cada cinco minutos enquanto estiver visível. Credenciais Microsoft e GitHub ficam na automação, nunca no site.
