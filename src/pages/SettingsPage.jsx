import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Field } from '../components/ui/Field';
import { useStore } from '../hooks/useStore';
import { useToast } from '../hooks/useToast';

export default function SettingsPage() {
  const { state, dispatch, exportData, importData, resetAll } = useStore();
  const toast = useToast();
  const fileRef = useRef(null);
  const [name, setName] = useState(state.settings.userName);
  const [error, setError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const saveName = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe um nome.');
      return;
    }
    setError('');
    dispatch({ type: 'SETTINGS_UPDATE', changes: { userName: name.trim() } });
    toast.success('Nome atualizado.');
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado.');
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      importData(await file.text());
      toast.success('Dados importados com sucesso.');
    } catch (err) {
      toast.error(err.message || 'Não foi possível importar o arquivo.');
    }
  };

  return (
    <>
      <PageHeader title="Configurações" subtitle="Preferências e gerenciamento dos dados salvos neste navegador." />

      <div className="grid max-w-3xl gap-6">
        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold">Perfil</h2>
          <form onSubmit={saveName} className="flex flex-wrap items-end gap-3" noValidate>
            <Field label="Seu nome" htmlFor="s-name" error={error} className="min-w-[220px] flex-1">
              <input id="s-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <button className="btn-primary">Salvar</button>
          </form>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold">Dados e backup</h2>
          <p className="mb-4 text-xs leading-relaxed text-mute">
            Seus dados ficam salvos apenas neste navegador (localStorage). Exporte um backup para guardá-los ou transferi-los
            para outro dispositivo.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={download}>
              <Download className="h-4 w-4" aria-hidden /> Exportar backup
            </button>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden /> Importar backup
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} aria-label="Selecionar arquivo de backup" />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold">Restaurar dados iniciais</h2>
          <p className="mb-4 text-xs leading-relaxed text-mute">
            Apaga todos os cursos, módulos, tarefas, eventos e sessões, e restaura apenas os quatro cursos iniciais.
          </p>
          <button className="btn-danger" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Restaurar dados iniciais
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Restaurar dados iniciais"
        message="Todos os seus dados atuais serão apagados e substituídos pelos cursos iniciais. Esta ação não pode ser desfeita. Deseja continuar?"
        confirmLabel="Restaurar"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
          toast.success('Dados restaurados.');
        }}
      />
    </>
  );
}
