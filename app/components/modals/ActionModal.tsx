import React from 'react';
import { Button } from '../Button';
interface ActionModalProps {
  id: string;
  title?: string;
  content?: string;
  buttonClose?: string;
  buttonConfirm?: string;
  onClickConfirm?: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  id,
  title,
  content,
  buttonClose,
  buttonConfirm,
  onClickConfirm
}) => {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4">{content}</p>
        <div className="modal-action">
          <form method="dialog" className="flex space-x-2 ">
            {buttonClose && (
              <Button customColor="bg-rose-300 hover:bg-rose-400" secondary>
                {buttonClose}
              </Button>
            )}
            {buttonConfirm && (
              <Button
                customColor="bg-sky-300 hover:bg-sky-400"
                secondary
                onClick={onClickConfirm}
              >
                {buttonConfirm}
              </Button>
            )}
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default ActionModal;
