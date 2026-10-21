# Pedido para o Cursor — Ofertinha 2.0

> **STATUS (20/10/2026): esta tarefa já foi executada** — ver `STATUS-AREA-LOGADA.md`
> e `supabase/README.md` (a única ação pendente é aplicar o SQL no Supabase).
> Não rode de novo sem ler o status para evitar duplicar arquivos e schema.

Você está no repositório Ofertinha 2.0 (Next.js 15 App Router, React 19, TypeScript), produto Pequenos Passos. Não recrie a landing nem o funil /qz. Construa a área logada em rotas novas, no mesmo app, com o visual que já existe.

## IDENTIDADE
Pais e responsáveis de crianças pequenas, e também professores. Tom acolhedor, ânimo, zero julgamento. A criança aprende junto com o adulto, em momentos de 5 a 10 minutos. Fontes já carregadas no layout: Baloo 2 nos títulos, Nunito no texto. Cores: fundo #fefaf2, navy #14306b, texto suave #55688f, verde #0d9f6e / #057a55, menta #d8f3e6, azul #2563eb, amarelo #fbbf24, coral #fb7185, cartão branco, raio 22px, sombra suave. Mobile primeiro, máximo ~480–960px de coluna, sem visual de dashboard corporativo cinza.

## LOGIN QUE JÁ EXISTE
O funil cria o usuário no Supabase Auth (email confirmado) e manda e-mail com o e-mail real e uma senha temporária que começa com "Pp". A área deve:
- Tela /entrar: e-mail + senha, link "esqueci minha senha".
- No primeiro acesso, se a senha ainda for a temporária, obrigar /entrar/nova-senha antes de qualquer entregável. Marque isso em app_metadata (não em user_metadata): must_change_password.
- Sessão com @supabase/ssr, cookies httpOnly. Nunca exponha service_role no client. RLS em toda tabela public.
- Papéis em app_metadata.role: "familia" (padrão) ou "admin". Admin não se promove pelo client.

## O QUE A PESSOA COMPROU
Libere só o que a compra cobre. Grave em entitlements (user_id, product, source, created_at):
- amostra: 10 atividades de demonstração já descritas em src/app/qz/amostra-data.ts. Quem só deixou e-mail no quiz entra aqui.
- kit-inicial (R$ 37,90): categorias para imprimir — Atenção visual e associação; Pré-alfabetização; Matemática visual; Coordenação motora (labirintos, picotados, recortes); Emoções e escolhas; Rotinas e organização; bônus certificado e quadro de conquistas; versão preto e branco.
- acesso-total (R$ 19,90, de R$ 97,00): tudo do kit + materiais atualizados + recursos para professores + app/navegador.
- bumps opcionais, cada um com a própria chave: rotina-visual (R$ 9,90), guia-30-dias (R$ 7,90), mini-kit-5-min (R$ 4,90), cartoes-vocabulario (R$ 13,90), combo (R$ 29,90 = os quatro).
Quem não tem o produto vê o card bloqueado com o nome e o preço, e um botão que volta ao funil /qz. Não misture o conteúdo pago na amostra.

## CATÁLOGO
Tabela activities: id, title, summary, category, duration_min (5, 10 ou 15), age_min, age_max, format (imprimir | tela | ambos), bw (bool), audience (familia | professor), product_key, tags text[], search tsvector em português. Categorias alinhadas aos módulos reais do produto: Atenção visual, Traçado e coordenação, Letras e sílabas, Palavras e leitura, Números e quantidades, Emoções, Rotinas, Vocabulário, Professores. Seed inicial com as 10 atividades da amostra e, por categoria do kit, fichas nomeadas no espírito de src/data/content.ts (diferenças, labirinto, tracejado, sílabas, contar, termômetro das emoções, quadro da manhã, cartões ilustrados). PDF ou página imprimível por atividade. Busca precisa funcionar sem o arquivo ainda existir: use páginas HTML imprimíveis no padrão visual do kit.

## ÁREA DE QUEM COMPROU — /app
1. Início: "Olá, {nome}. Que bom ter vocês aqui." Um próximo passo sugerido de 5 a 10 minutos, com base na categoria da pergunta 4 do quiz se o lead existir (figuras → atenção visual; letras → pré-alfabetização; números → matemática; mãos → coordenação; descobrindo → mix). Streak de dias em que a família marcou "fizemos juntos". Uma frase de ânimo, nunca cobrança.
2. Biblioteca: grade de cards por categoria, filtro por tempo, idade, imprimir/tela, preto e branco, família/professor. Busca instantânea por título, tag e categoria, com destaque do termo. Estado vazio acolhedor. Favoritos.
3. Atividade: título, para que serve, como apresentar em uma frase, botão Imprimir, botão "Fizemos juntos hoje". Ao concluir, celebração curta (não um modal que trava) e +1 estrela.
4. Trilha de 30 dias: só com o bump guia-30-dias ou acesso-total. Um dia por vez, o anterior fica visível, o futuro aparece como "amanhã".
5. Criança: nome, idade aproximada (3–8). As recompensas são da criança, a navegação é do adulto.
6. Conquistas, visíveis também como quadro para imprimir:
   - primeira atividade
   - 5, 10 e 20 estrelas
   - 3 dias seguidos e 7 dias seguidos
   - uma categoria completa
   - certificado com o nome da criança, data e a frase "aprendeu junto com quem cuida"
   Recompensas são estrelas, selos e o certificado. Sem ranking público, sem moeda, sem loja, sem pressão de tela.
7. Conta: trocar senha, ver o que está liberado, sair.

## CRM ADMIN — /admin
Só role admin. Mesmo visual, mais denso, ainda legível no celular.
- Funil: leads do quiz (nome, e-mail, canal, 6 respostas, data, se virou compra). Origem: o payload que POST /api/quiz-lead já recebe. Persista esse lead no Supabase nessa entrega.
- Pessoas: busca por nome ou e-mail, ficha com compras, entitlements, último acesso, atividades concluídas, streak.
- Ações: liberar ou revogar produto, reenviar o e-mail de acesso (o template festivo de src/lib/emails.ts), marcar senha para troca, anotar um comentário interno.
- Catálogo: criar e editar atividade, publicar ou ocultar, ver quais produtos enxergam cada item.
- Painel: visitas do funil se já estiverem no dataLayer não entram aqui; use só o que está no banco: leads, compras, ativos nos últimos 7 dias, atividades mais concluídas. Números honestos, sem métrica inventada.
Admin não vê senha. Reset gera senha temporária nova e dispara o e-mail, nunca mostra a senha na tela depois do envio.

## REGRAS
- RLS: família lê e escreve só as próprias linhas (perfil, progresso, favoritos, criança). Atividades são leitura pública apenas das que o entitlement cobre, via policy ou view security_invoker. Admin usa checagem de app_metadata.role no servidor.
- Não use user_metadata para autorização.
- Textos em português do Brasil.
- Não altere o visual das telas Stitch em public/funil.
- Não invente preço, módulo ou depoimento.
- Pagamento real continua desligado. Entitlement de compra entra por ação do admin ou por um endpoint servidor chamado depois do checkout, pronto para o gateway futuro.
- Ao terminar: login com a senha temporária, troca obrigatória, biblioteca filtrada pelo produto, busca, "fizemos juntos" gerando estrela, e um admin conseguindo achar o lead e liberar o kit.

## ORDEM
1. Schema + RLS + seed.
2. /entrar e troca de senha.
3. /app biblioteca, busca, atividade, progresso e conquistas.
4. Persistir lead do quiz e o CRM /admin.
5. Conferir no navegador os dois papéis, inclusive quem só tem a amostra e não pode abrir o kit.
