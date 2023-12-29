import getSingleConversation from '@/app/actions/getSingleConversation';
import EmptyState from '@/app/components/EmptyState';
import Header from './components/Header';
import Form from './components/Form';
import Body from './components/Body';

interface IParams {
  conversationId: string;
}

const ConversationId = async ({ params }: { params: IParams }) => {
  const conversation = await getSingleConversation(params.conversationId);
  console.log(conversation);

  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-80 h-full ">
      <div className="h-full flex flex-col text-black bg-emerald-900 bg-opacity-10">
        <Header conversation={conversation} />
        <Body />
        <Form />
      </div>
    </div>
  );
};

export default ConversationId;
