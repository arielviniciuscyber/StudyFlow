# StudyFlow

Sistema web pessoal para organizar cursos, estudos e compromissos acadêmicos.
Construído com **React + Vite + Tailwind CSS + React Router + Lucide React**. Sem backend: os dados ficam no `localStorage` do navegador.

## Como executar

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera a pasta dist/
npm run preview  # pré-visualiza o build
```

Requer Node.js 18 ou superior.

## Funcionalidades

- Dashboard com indicadores calculados a partir dos dados reais, cursos em grade ou lista, filtros, pesquisa e ordenação
- Página individual por curso: informações, módulos e aulas (adicionar, editar, excluir, reordenar), anotações com salvamento automático, tarefas e botão **Acessar plataforma**
- Progresso calculado automaticamente a partir dos módulos/aulas, com opção de ajuste manual
- Calendário mensal com eventos, prazos de tarefas, filtro por curso e lista de próximos compromissos
- Gerenciador de tarefas com seções de atrasadas e próximas do vencimento
- Planejamento: metas diárias, semanais e por curso, sessões de estudo, planejado x realizado
- Histórico de estudos, busca global (Ctrl/Cmd + K), notificações derivadas dos dados
- Backup: exportar/importar JSON e restaurar dados iniciais (Configurações)

## Cursos iniciais

Python (Santander Open Academy), Tecnologia da Informação (FIAP), Gran Cursos — Preparação Transpetro e Curso de Caraguatatuba. São cadastrados uma única vez, na primeira utilização (IDs fixos e deduplicação garantem que não se repitam). Carga horária, certificado e conteúdo oficial ficam em branco para preenchimento manual.

Os links das plataformas apenas abrem os sites em nova aba; nenhum dado interno é acessado.

## Estrutura

```
src/
  components/{layout,dashboard,courses,calendar,tasks,planning,ui}/
  pages/        hooks/        services/ (storage + reducer)
  utils/        data/         assets/
```

Chave de armazenamento: `studyflow:data:v1`.
# StudyFlow
