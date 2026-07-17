import { useEffect } from 'react';
import { useGoal } from '@/contexts/GoalContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import TableShell from '@/components/TableShell';
import TableEmptyState from '@/components/TableEmptyState';
import Money from '@/components/Money';
import '@/styles/HistoryPages.scss';

const Objetivo = () => {
  const { goals, isLoading, error, fetchGoals } = useGoal();
  const { periodQuery } = useDateFilter();

  useEffect(() => {
    void fetchGoals();
  }, [periodQuery]);

  return (
    <section className="history-page">
      <header className="history-page__header">
        <h1 className="history-page__title">Objetivos</h1>
      </header>

      {error && <p className="history-page__error">{error}</p>}

      <TableShell>
        <table className="history-page__table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Meta</th>
              <th>Aportado</th>
              <th>Restante</th>
              <th>Concluido</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => (
              <tr key={goal.id}>
                <td>{goal.nome}</td>
                <td><Money value={goal.valorTotal} /></td>
                <td><Money value={goal.valorAportado} /></td>
                <td><Money value={goal.valorRestante} /></td>
                <td>{goal.percentualConcluido}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <TableEmptyState
          hasItems={goals.length > 0}
          isLoading={isLoading}
          loadingText="Carregando objetivos..."
          emptyText="Nenhum objetivo encontrado para o periodo selecionado."
          className="history-page__empty"
        />
      </TableShell>
    </section>
  );
};

export default Objetivo;
