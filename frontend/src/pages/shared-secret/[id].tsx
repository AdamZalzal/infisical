import { useTranslation } from "react-i18next";
import Head from "next/head";
import { useSelectSharedSecret } from "@app/hooks/api/organization/queries";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClipboard, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@app/components/v2";

const ShareSecrets = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const { data, isLoading } = useSelectSharedSecret(router.query.id as string);
  useEffect(() => {
    if (data?.secret && !isLoading) {
      setSecret(data.secret);
    }
  }, [data]);

  const handleCopyPress = useCallback(() => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  }, [secret, setSecretCopied]);

  const handleShowSecretPress = useCallback(() => {
    setShowSecret(!showSecret);
  }, [showSecret, setShowSecret]);

  return isLoading ? (
    <div className="flex h-screen w-screen items-center justify-center bg-bunker-800">
      <img
        src="/images/loading/loading.gif"
        height={70}
        width={120}
        decoding="async"
        loading="lazy"
        alt="infisical loading indicator"
      />
    </div>
  ) : (
    <>
      <Head>
        <title>Shared Secret</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
      </Head>
      <div className="flex h-screen w-screen justify-center bg-bunker-800 text-white">
        <div className="m-auto w-full max-w-7xl px-6">
          <div className="m-auto w-fit">
            {!data?.error ? (
              <>
                <div className="m-auto pb-5 text-3xl font-semibold text-gray-200 ">
                  Shared Secret:
                </div>
                <div className=" m-auto flex h-fit w-fit max-w-7xl flex-row bg-mineshaft-600 p-5 text-lg text-mineshaft-300">
                  <Input value={secret} type={showSecret ? "text" : "password"}></Input>
                  <button
                    type="button"
                    onClick={handleShowSecretPress}
                    className="my-auto h-full pl-5 pr-2 text-bunker-300 duration-200 hover:text-primary-200"
                  >
                    {showSecret ? (
                      <FontAwesomeIcon icon={faEyeSlash} className="pr-0.5" />
                    ) : (
                      <FontAwesomeIcon icon={faEye} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPress}
                    className="my-auto h-full pl-5 pr-2 text-bunker-300 duration-200 hover:text-primary-200"
                  >
                    {secretCopied ? (
                      <FontAwesomeIcon icon={faCheck} className="pr-0.5" />
                    ) : (
                      <FontAwesomeIcon icon={faClipboard} />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="m-auto pb-5 text-3xl font-semibold text-gray-200 ">
                This link is no longer valid
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShareSecrets;
