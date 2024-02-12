import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordForgotForm from './components/PasswordForgotForm';

export default function PasswordForgot() {
  return (
    <div className="flex min-h-full justify-center items-center">
      <Card className=" w-11/12 md:w-[450px]">
        <CardHeader>
          <div className="flex justify-center text-lg ">
            <CardTitle>Forgot password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PasswordForgotForm />
        </CardContent>
      </Card>
    </div>
  );
}
