import ButtonPrimary from "../components/ButtonPrimary";
import ButtonPrimaryWithIcon from "../components/ButtonPrimaryWithIcon";
import ButtonIcon from "../components/ButtonIcon";

import logo from "../assets/BigTrooperLogo.svg";
import Bone from "../assets/bone.svg";
import Profile from "../assets/account.svg";
import Logout from "../assets/log-out.svg";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const ButtonSection = loading ? (
    <div className="h-full w-full flex flex-row items-center justify-end p-2.5 gap-3.75 invisible" />
  ) : !user ? (
    <div className="h-full w-full flex flex-row items-center justify-end p-2.5 gap-3.75">
      <ButtonPrimary to="/register" className="bg-trooper-amber">
        Register
      </ButtonPrimary>
      <ButtonPrimary to="/login"> Login</ButtonPrimary>
    </div>
  ) : (
    <div className="h-full w-full flex flex-row items-center justify-end p-2.5 gap-3.75">
      <ButtonIcon icon={Profile} to="/account" />
      <ButtonPrimaryWithIcon to="/pets" icon={Bone}>
        Pets
      </ButtonPrimaryWithIcon>
      <ButtonPrimaryWithIcon
        className="bg-transparent border-[3px] border-trooper-tan"
        icon={Logout}
        onClick={async () => { await logout(); navigate("/"); }}
      >
        <span className="text-trooper-tan">Logout</span>
      </ButtonPrimaryWithIcon>
    </div>
  );

  return (
    <header className="flex flex-row w-full h-18 bg-trooper-black">
      <div className="h-full w-full flex flex-row justify-right"></div>
      <div className="h-full w-full flex flex-row justify-center">
        <a href="/">
          <img src={logo} alt="Big Trooper" className="w-fit h-full" />
        </a>
      </div>
      {ButtonSection}
    </header>
  );
}
