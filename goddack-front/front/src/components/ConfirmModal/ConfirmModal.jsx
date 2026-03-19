import './ConfirmModal.css';

const ConfirmModal = ({ message = '¿Estás seguro?', onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>¿Confirmar acción?</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="modal-cancel" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="modal-confirm" onClick={onConfirm}>
                        Sí, confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;