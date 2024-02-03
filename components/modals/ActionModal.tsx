import React, { ReactElement } from 'react';
import { Button } from '../ui/button';
interface ActionModalProps {
  id: string;
  title?: string;
  content?: ReactElement;
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
        {content}
        <div className="modal-action">
          <form method="dialog" className="flex space-x-2 ">
            {buttonClose && (
              <Button color="bg-rose-300 hover:bg-rose-400">{buttonClose}</Button>
            )}
            {buttonConfirm && (
              <Button color="bg-sky-300 hover:bg-sky-400" onClick={onClickConfirm}>
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
