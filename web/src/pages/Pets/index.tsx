import { useState } from "react";
import ButtonPrimaryWithIcon from "../../components/ButtonPrimaryWithIcon";
import TextInput from "../../components/TextInput";
import SelectInput from "../../components/SelectInput";
import PetCard from "../../components/PetCard";

import PawPrint from "../../assets/paw-print.svg";

export default function PetIndex() {
  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center">
      <h1 className="text-[40px] font-bold text-trooper-black text-center mt-12.5">
        Pet Managment
      </h1>
      <p className="text-[16px] text-trooper-black">
        Please Provide additional details
      </p>

      <div className="grid grid-cols-3 gap-6 mt-4">
        <PetCard></PetCard>
        <PetCard></PetCard>
        <PetCard></PetCard>
        <PetCard></PetCard>
        <PetCard></PetCard>
      </div>
    </div>
  );
}
