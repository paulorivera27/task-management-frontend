import { useState } from "react";
import {
  PageTitle,
  MainContainer,
  SecondaryContainer,
} from "../components/styles/taskList";
import {
  Input,
  ErrorText,
  HintText,
  FlexColumnContainer,
} from "../components/styles/taskForm";
import {
  SignUpSignInBtn,
  SignUpSignInContainer,
} from "../components/styles/LoginPage";
import { useAuth } from "../context/useAuth";
import { useTranslation } from "react-i18next";
import { errorMessageKey, translateServerMessage } from "../lib/errors";
import { useMutation } from "@apollo/client/react";
import LoadingComponent from "../components/LoadingComponent";
import { Navigate, useLocation, type Location } from "react-router-dom";
import type { SignInData, SignUpData } from "../types";
import { SIGN_IN, SIGN_UP } from "../graphql/mutations";
import LanguageSwitcher from "../components/LanguageSwitcher";
import {
  Button,
  FlexRowContainer,
  VisuallyHiddenLabel,
} from "../components/styles/shared";

const MIN_PASSWORD_LENGTH = 8;

interface Credentials {
  email: string;
  password: string;
}

function redirectTarget(state: unknown): string {
  const from = (state as { from?: Location } | null)?.from;
  if (!from?.pathname.startsWith("/") || from.pathname.startsWith("//")) {
    return "/";
  }
  return `${from.pathname}${from.search}${from.hash}`;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    login,
    sessionExpired,
    isAuthenticated,
    loading: bootstrapping,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [signIn, { loading: signingIn }] = useMutation<
    SignInData,
    Credentials
  >(SIGN_IN);
  const [signUp, { loading: signingUp }] = useMutation<
    SignUpData,
    Credentials
  >(SIGN_UP);

  const loading = signingIn || signingUp;

  if (bootstrapping) return <LoadingComponent />;

  if (isAuthenticated) {
    return <Navigate to={redirectTarget(location.state)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const payload = isSignUp
        ? (await signUp({ variables: { email, password } })).data?.signUp
        : (await signIn({ variables: { email, password } })).data?.signIn;

      if (payload?.errors?.length) {
        setFormError(
          payload.errors.map((e) => translateServerMessage(e, t)).join(", "),
        );
        return;
      }

      if (payload?.token && payload.user) {
        login(payload.token, payload.user);
      }
    } catch (err) {
      setFormError(t(errorMessageKey(err)));
    }
  };

  return (
    <MainContainer>
      <FlexRowContainer $justify="flex-end">
        <LanguageSwitcher />
      </FlexRowContainer>

      <PageTitle>
        {isSignUp ? t("auth.sign_up_title") : t("auth.sign_in_title")}
      </PageTitle>

      <SecondaryContainer>
        {sessionExpired && (
          <ErrorText role="status">{t("errors.session_expired")}</ErrorText>
        )}
        <form onSubmit={handleSubmit}>
          <FlexColumnContainer $align="normal">
            <VisuallyHiddenLabel htmlFor="email">
              {t("auth.email_placeholder")}
            </VisuallyHiddenLabel>
            <Input
              required
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email_placeholder")}
            />

            <VisuallyHiddenLabel htmlFor="password">
              {t("auth.password_placeholder")}
            </VisuallyHiddenLabel>
            <Input
              required
              id="password"
              type="password"
              value={password}
              minLength={isSignUp ? MIN_PASSWORD_LENGTH : undefined}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              aria-describedby={isSignUp ? "password-hint" : undefined}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password_placeholder")}
            />

            {isSignUp && (
              <HintText id="password-hint">{t("auth.password_hint")}</HintText>
            )}

            <Button type="submit" disabled={loading}>
              {loading
                ? t("auth.loading")
                : isSignUp
                  ? t("auth.sign_up_button")
                  : t("auth.sign_in_button")}
            </Button>

            {formError && <ErrorText role="alert">{formError}</ErrorText>}
          </FlexColumnContainer>
        </form>
      </SecondaryContainer>

      <SignUpSignInContainer>
        {isSignUp ? t("auth.has_account") : t("auth.no_account")}{" "}
        <SignUpSignInBtn
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setFormError(null);
          }}
        >
          {isSignUp ? t("auth.sign_in_link") : t("auth.sign_up_link")}
        </SignUpSignInBtn>
      </SignUpSignInContainer>
    </MainContainer>
  );
}
