import { useState } from 'react';
import styles from './GoalCard.module.css';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
}

interface GoalCardProps {
  goal: Goal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.goalCard} onClick={() => setExpanded(!expanded)}>
      <h3 className={styles.goalTitle}>{goal.title}</h3>
      {goal.description && <p className={styles.goalDescription}>{goal.description}</p>}

      {expanded && (
        <ul className={styles.taskList}>
          {goal.tasks.map((task) => (
            <li
              key={task.id}
              className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
            >
              {task.title}
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={task.completed}
                readOnly
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
