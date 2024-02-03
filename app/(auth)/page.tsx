import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          lg:px-8"
    >
      <Card className=" w-11/12 md:w-[450px]">
        <CardHeader>
          <div className="flex justify-center text-lg ">
            <CardTitle>Sign in with</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
