"use client";

import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { handleLogin } from "@/actions/auth.actions";
import Image from "next/image";
import background from "@/public/images/mountains-background.jpg";
import Weather from "@/components/Weather";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const apiURI = "https://dev.phc.events";

const Greetings = [
  "Howdy!",
  "Welcome Back.",
  "Nice to see you!",
  "Sup, homeslice?",
  "What's crackin'?",
  "Hi!",
  "Ahoy, matey!",
  "Peek-a-boo!",
  "Yo!",
  "Greetings and salutations!",
  "Aloha!",
  "Hola!",
  "Que pasa!",
  "Bonjour!",
  "Ciao!",
];

export default function Login({ path = "/" }) {
  const router = useRouter();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [CurrentTime, setCurrentTime] = useState(new Date());
  const [currGreeting, setCurrGreeting] = useState("");

  useEffect(() => {
    // Set the greeting on component mount (client-side only)
    setCurrGreeting(Greetings[Math.floor(Math.random() * Greetings.length)]);

    // Update the time every second
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const tokenData = await axios({
        method: "post",
        url: `${apiURI}/api/auth/authorize`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          username: username,
          password: password,
        }),
      }).then((response) => response.data);
      const { access_token, expires_in, refresh_token } = tokenData;
      const login: Boolean = await handleLogin({
        access_token,
        expires_in,
        refresh_token,
      });
      if (login) {
        router.push(path);
      } else {
        // show error message
        // only happens when no user is found
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="h-[100vh]">
      <div
        className={`absolute w-full h-full transition-transform duration-500 ${
          showLoginForm === true && "-translate-y-full"
        }`}
        onClick={() => setShowLoginForm(true)}
      >
        <Image src={background} className="h-full" alt="mountain scene" />
        <div className="gradient-overlay"></div>
      </div>
      <div className={`${showLoginForm ? "hidden" : ""}`}>
        <p id="greeting" className="font-light">
          {currGreeting}
        </p>
        <div>
          <h1 id="time" className="clock font-light">
            {CurrentTime.toLocaleTimeString([], { timeStyle: "short" })
              .replace("AM", "")
              .replace("PM", "")}
          </h1>
        </div>
      </div>

      <div className="login-button-container">
        <button
          className="login-button clear-button"
          onClick={() => setShowLoginForm(true)}
        >
          <i className="fa fa-sign-in font-light"></i>
        </button>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errorMsg && <p id="error-msg">{errorMsg}</p>}
          <input
            type="text"
            className="clear input font-light p-1.5 rounded-sm bg-slate-400/10 md:w-96"
            name="username"
            placeholder="Username"
            autoComplete="off"
          />
          <input
            type="password"
            className="clear input font-light p-1.5 rounded-sm bg-slate-400/10 md:w-96"
            name="password"
            placeholder="Password"
            autoComplete="off"
          />
          <Button className="clear input font-light" type="submit">
            Login
          </Button>
          <div className="flex justify-between">
            <button
              className="link-button font-dark"
              onClick={() => setShowLoginForm(false)}
              type="button"
            >
              Cancel
            </button>
            <a
              href="https://my.pureheart.org/ministryplatformapi/oauth/reset"
              className="link-button font-dark"
            >
              Forgot Password
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
