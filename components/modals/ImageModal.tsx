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
      <DialogContent className="min-w-[300px] min-h-[350px] max-w-[600px] max-h-[1000px]">
        <Image className="object-fill" alt="Image" fill src={viewImage?.image} />
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
