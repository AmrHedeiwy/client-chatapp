import Image from 'next/image';

import UploadDropzone from './UploadDropzone';
import { FileIcon, X } from 'lucide-react';

type FileUploadProps = {
  onChange: (file?: File) => void;
  value: (Blob & File) | undefined;
  setError: any;
  isModalOpen: boolean;
};

function FileUpload({ onChange, value, setError, isModalOpen }: FileUploadProps) {
  let fileType = value ? value.type.split('/').pop() : null;

  let preview = value ? URL.createObjectURL(value) : null;

  if (!isModalOpen && (value || preview)) {
    if (preview) URL.revokeObjectURL(preview);
    preview = null;
    value = undefined;
  }

  if (preview && fileType !== 'pdf') {
    return (
      <div className="relative h-20 w-20">
        <Image fill src={preview} alt="Upload" className="rounded-full" />
        <button
          onClick={() => {
            onChange(undefined);
            URL.revokeObjectURL(preview);
          }}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (preview && fileType === 'pdf') {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={preview}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {preview}
        </a>
        <button
          onClick={() => {
            onChange(undefined);
            URL.revokeObjectURL(preview);
          }}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return <UploadDropzone onChange={onChange} setError={setError} />;
}
export default FileUpload;
