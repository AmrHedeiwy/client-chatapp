'use client';

import { ChangeEventHandler, useState } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

interface MessageInputProps {
  placeholder?: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const MessageInput: React.FC<MessageInputProps> = ({
  placeholder,
  id,
  type,
  required,
  register
}) => {
  const [textareaHeight, setTextareaHeight] = useState('auto');

  const handleTextareaChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const textareaHeight = e.target.offsetHeight;
    const currentRows = Math.floor(e.target.scrollHeight / textareaHeight);

    setTextareaHeight(`${currentRows * textareaHeight}px`);
  };
  return (
    <div className="relative w-full ">
      <textarea
        id={id}
        autoComplete="off"
        {...register(id, { required })}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        className="
        textarea
        text-black
        bg-white 
        w-full 
        placeholder:text-sm
        placeholder:font-normal
        placeholder:text-gray-500
        rounded-md
        focus:outline-none
        resize-none
        scrollable-content
        "
        style={{
          lineHeight: '1.5em',
          height: textareaHeight,
          minHeight: '3em',
          maxHeight: '6em'
        }}
        rows={1}
      />
    </div>
  );
};

export default MessageInput;
