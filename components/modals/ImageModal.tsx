'use client';

import { useModal } from '@/hooks/useModal';
import Image from 'next/image';
import { Dialog, DialogContent } from '../ui/dialog';

const ImageModal = () => {
  const { isOpen, type, onClose, data } = useModal();

  const isModalOpen = isOpen && type === 'viewImage';

  const { viewImage } = data;

  if (!viewImage || !viewImage.image) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <Image alt="Image" height={300} width={600} src={viewImage?.image} />
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
