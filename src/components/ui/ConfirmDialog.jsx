import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Excluir', onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-mute">{message}</p>
    </Modal>
  );
}
