import AuthForm from './components/AuthForm';

export default function Home() {
  return (
    <div
      className="
          flex
          min-h-full
          flex-col
          justify-center
          items-center
          py-12
          sm:px-6
          lg:px-8
          bg-gray-50
          "
    >
      <div className="container bg-gray-100 flex rounded-2xl shadow-lg max-w-lg">
        <div className="p-8 w-full">
          <h1 className="text-center text-xl font-semibold text-gray-900 space-y-4 mb-8">
            Sign in with
          </h1>

          <AuthForm />
        </div>
      </div>
    </div>
  );
}
