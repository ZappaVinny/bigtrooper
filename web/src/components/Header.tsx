import logo from "../assets/BigTrooperLogo.svg";
import ButtonPrimary from "../components/ButtonPrimary";

export default function Header() {
  return (
    <header className="flex flex-row w-full h-18 bg-trooper-black">
      <div className="h-full w-full flex flex-row justify-right"></div>
      <div className="h-full w-full flex flex-row justify-center">
        <a href="/">
          <img src={logo} alt="Big Trooper" className="w-fit h-full" />
        </a>
      </div>
      <div className="h-full w-full flex flex-row items-center justify-end p-2.5 gap-3.75">
        <ButtonPrimary to="/register" bgcolor="bg-trooper-amber">
          Register
        </ButtonPrimary>
        <ButtonPrimary to="/login"> Login</ButtonPrimary>
      </div>
    </header>
  );
}
