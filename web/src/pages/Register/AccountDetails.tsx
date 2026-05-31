import TextInput from "../../components/TextInput";
import ButtonPrimaryWithIcon from "../../components/ButtonPrimaryWithIcon";

import PawPrint from "../../assets/paw-print.svg";

export default function AccountDetails({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center justify-center gap-3">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-trooper-black">Register</h1>
        <p className="text-[16px] text-trooper-black">
          Register for a brand new account
        </p>
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="email" className="text-[24px] text-trooper-black">
          Email
        </label>
        <TextInput placeholder="Email" className="w-100" />
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="phone" className="text-[24px] text-trooper-black">
          Phone
        </label>
        <TextInput placeholder="Phone" className="w-100" />
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="Password" className="text-[24px] text-trooper-black">
          Password
        </label>
        <TextInput
          placeholder="Password"
          inputType="password"
          className="w-100"
        />
      </div>
      <div className="flex flex-col items-center">
        <label
          htmlFor="confirmPassword"
          className="text-[24px] text-trooper-black"
        >
          Confirm Password
        </label>
        <TextInput
          placeholder="Confirm Password"
          inputType="password"
          className="w-100"
        />
      </div>

      <div className="flex flex-col items-center mt-3">
        <ButtonPrimaryWithIcon
          onClick={onNext}
          className="
            h-12
            w-100
            bg-trooper-tan
            border-[3px]
            border-trooper-black
          "
          icon={PawPrint}
        >
          Next
        </ButtonPrimaryWithIcon>
      </div>
    </div>
  );
}
