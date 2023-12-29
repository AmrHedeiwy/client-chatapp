'use client';

import * as y from 'yup';
import { HiPaperAirplane } from 'react-icons/hi2';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import useConversation from '@/app/hooks/useConversation';
import MessageInput from './MessageInput';
import Link from '@/app/components/Link';
import { yupResolver } from '@hookform/resolvers/yup';

const formSchema = y.object({
  Content: y.string().min(1)
});

const Form = () => {
  const { conversationId } = useConversation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FieldValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      Content: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    console.log(data);
  };

  return (
    <div
      className="
        pt-4 
        px-4 
        border-t 
        border-gray-50
        flex
        pb-2 
        gap-2 
        lg:gap-4 
        w-full
      "
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-2 lg:gap-4 w-full items-center"
      >
        <MessageInput
          id="Content"
          register={register}
          errors={errors}
          required
          placeholder="Type your message..."
        />

        <div className="">
          <Link withButton>
            <HiPaperAirplane size={25} className="text-green-400" />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Form;
