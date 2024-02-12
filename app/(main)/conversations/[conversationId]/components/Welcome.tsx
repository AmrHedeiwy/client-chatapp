type WelcomeProps = {
  name: string;
  isGroup: boolean;
};

export const Welcome = ({ name, isGroup }: WelcomeProps) => {
  return (
    <div className="space-y-2 px-4 mb-4">
      <p className="text-xl md:text-3xl font-bold">
        {isGroup ? 'Welcome to ' : ''}
        {name}
      </p>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm">
        {isGroup
          ? `This is the start of the ${name} group.`
          : `This is the start of your conversation with ${name}`}
      </p>
    </div>
  );
};
