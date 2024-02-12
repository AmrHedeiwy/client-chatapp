import { UploadCloud } from 'lucide-react';

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/config/file';

import { useCallback } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { useModal } from '@/hooks/useModal';

function UploadDropzone({
  onChange,
  setError
}: {
  onChange: (file?: File) => void;
  setError: any;
}) {
  const { type } = useModal();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length !== 0) {
        const firstFileError = rejectedFiles[0].errors[0];

        if (firstFileError.code === 'file-invalid-type')
          firstFileError.message = `File must be an image${
            type === 'messageFile' ? ' or pdf' : ''
          }`;

        if (firstFileError.code === 'file-too-large')
          firstFileError.message = 'File is larger than 4MB';

        // For code 'too-many-files', use the default error message -> 'Too many files'

        setError('file', { message: firstFileError.message });
      }
      acceptedFiles.forEach((file) => {
        onChange(file);
      });
    },
    [onChange, setError, type]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ALLOWED_FILE_TYPES.image,
      ...(type === 'messageFile'
        ? { 'application/pdf': ALLOWED_FILE_TYPES.application } // allow pdfs when sending messages
        : {})
    },
    maxFiles: type === 'messageFile' ? 5 : 1,
    maxSize: MAX_FILE_SIZE,
    onDrop
  });

  return (
    <div
      {...getRootProps()}
      className="border border-dashed rounded-lg p-10 select-none outline-none"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <div className="flex flex-col items-center gap-y-4">
          <UploadCloud size={50} className="text-gray-600 dark:text-gray-400" />
          <p className="font-bold text-blue-700 dark:text-blue-500">
            Choose files or drag and drop
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Image (4MB)</p>
        </div>
      )}
    </div>
  );
}
export default UploadDropzone;
