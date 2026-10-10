import { useState } from 'react';
import { useStore } from './useStore';
import { useToast } from './useToast';
import TaskForm from '../components/tasks/TaskForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';

/** Concentra criação/edição/exclusão de tarefas com formulário e confirmação. */
export function useTaskActions({ defaultCourseId = '' } = {}) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | task
  const [deleting, setDeleting] = useState(null);

  const toggle = (task) => {
    dispatch({ type: 'TASK_TOGGLE', id: task.id });
    toast.success(task.status === 'concluida' ? 'Tarefa reaberta.' : 'Tarefa concluída.');
  };

  const modals = (
    <>
      {editing && (
        <TaskForm
          key={editing === 'new' ? 'new' : editing.id}
          open
          initial={editing === 'new' ? null : editing}
          defaultCourseId={defaultCourseId}
          onClose={() => setEditing(null)}
          onSubmit={(data) => {
            if (editing === 'new') {
              dispatch({ type: 'TASK_ADD', task: data });
              toast.success('Tarefa criada.');
            } else {
              dispatch({ type: 'TASK_UPDATE', id: editing.id, changes: data });
              toast.success('Tarefa atualizada.');
            }
            setEditing(null);
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Excluir tarefa"
        message={`Deseja excluir a tarefa "${deleting?.title}"? Esta ação não pode ser desfeita.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          dispatch({ type: 'TASK_DELETE', id: deleting.id });
          toast.success('Tarefa excluída.');
          setDeleting(null);
        }}
      />
    </>
  );

  return {
    toggle,
    openNew: () => setEditing('new'),
    openEdit: (t) => setEditing(t),
    askDelete: (t) => setDeleting(t),
    modals,
  };
}
