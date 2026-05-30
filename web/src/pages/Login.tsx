import TextInput from "../components/TextInput";
import ButtonPrimaryWithIcon from "../components/ButtonPrimaryWithIcon";

import PawPrint from "../assets/paw-print.svg";

export default function Login() {
  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center justify-center gap-3">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-trooper-black">Login</h1>
        <p className="text-[16px] text-trooper-black">
          Login to your BigTrooper account
        </p>
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="email" className="text-[24px] text-trooper-black">
          Email/Phone
        </label>
        <TextInput placeholder="Email or Phone Number" length="w-[400px]" />
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="Password" className="text-[24px] text-trooper-black">
          Password
        </label>
        <TextInput
          placeholder="Password"
          inputType="password"
          length="w-[400px]"
        />
      </div>

      <div className="flex flex-col items-center mt-3">
        <ButtonPrimaryWithIcon
          onClick={() => alert("Login functionality not implemented yet")}
          height="h-12"
          length="w-[400px]"
          bgcolor="bg-trooper-tan"
          bordercolor="border-trooper-black "
          icon={PawPrint}
        >
          Log In
        </ButtonPrimaryWithIcon>
      </div>
    </div>
  );
}
