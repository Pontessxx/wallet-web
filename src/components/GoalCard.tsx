import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { addMonths, differenceInCalendarMonths } from 'date-fns';
import Money from '@/components/Money';
import { getGoalIcon } from '@/utils/goalVisuals';
import type { Goal } from '@/types/goal';

interface GoalCardProps {
  goal: Goal;
  registerMenuBtnRef: (id: string) => (el: HTMLButtonElement | null) => void;
  onToggleMenu: (id: string) => void;
  onDeposit: (goal: Goal) => void;
}

const GoalCard = ({ goal, registerMenuBtnRef, onToggleMenu, onDeposit }: GoalCardProps) => {
  const isComplete = goal.percentualConcluido >= 100;
  const ringValue = Math.min(goal.percentualConcluido, 100);
  const Icon = getGoalIcon(goal.iconKey);

  const dataAlvo = addMonths(new Date(goal.criadaEm), goal.meses);
  const mesesRestantes = Math.max(0, differenceInCalendarMonths(dataAlvo, new Date()));

  return (
    <article
      className={`goal-card${isComplete ? ' goal-card--complete' : ''}`}
      onClick={() => onDeposit(goal)}
    >
      <header className="goal-card__header">
        <span className="goal-card__icon">
          <Icon size={16} />
        </span>
        <h2 className="goal-card__name">{goal.nome}</h2>

        {!goal.carteiraId && (
          <button
            type="button"
            className="goal-card__deposit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDeposit(goal);
            }}
            aria-label="Depositar"
          >
            +
          </button>
        )}

        <button
          type="button"
          ref={registerMenuBtnRef(goal.id)}
          className="goal-card__menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(goal.id);
          }}
          aria-label="Ações"
        >
          ⋮
        </button>
      </header>

      <div className="goal-card__body">
        <dl className="goal-card__stats">
          <div>
            <dt>Objetivo</dt>
            <dd><Money value={goal.valorTotal} /></dd>
          </div>
          <div>
            <dt>Ideal por mês</dt>
            <dd><Money value={goal.valorMensal} /></dd>
          </div>
        </dl>

        <div className="goal-card__ring">
          <div className="goal-card__gauge">
            <CircularProgressbarWithChildren
              value={ringValue}
              strokeWidth={9}
              styles={buildStyles({
                pathColor: isComplete ? 'var(--color-success)' : 'var(--color-info)',
                trailColor: 'var(--color-border)',
                pathTransitionDuration: 0.6,
              })}
            >
              <span className="goal-card__percent">
                {Math.round(goal.percentualConcluido)}%
              </span>
            </CircularProgressbarWithChildren>
          </div>
          <span className="goal-card__aportado">
            <Money value={goal.valorAportado} />
          </span>
          {!isComplete && (
            <span className="goal-card__restante">
              faltam <Money value={goal.valorRestante} />
            </span>
          )}
        </div>
      </div>

      <footer className="goal-card__footer">
        {goal.carteiraId ? (
          <span className="goal-card__wallet-badge">Atrelado a {goal.carteiraNome ?? 'carteira'}</span>
        ) : isComplete ? (
          <span className="goal-card__complete-badge">Concluído</span>
        ) : (
          <span className="goal-card__deadline">
            Espero alcançar em {dataAlvo.toLocaleDateString('pt-BR')} · faltam {mesesRestantes} {mesesRestantes === 1 ? 'mês' : 'meses'}
          </span>
        )}
      </footer>
    </article>
  );
};

export default GoalCard;
