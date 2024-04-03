import { useTranslation } from "react-i18next";
import Head from "next/head";
import { AdminLayout } from "@app/layouts";
import { AdminDashboardPage } from "@app/views/admin/DashboardPage";
import { NonePage } from "@app/views/Org/NonePage";
import { OrgPermissionActions, OrgPermissionSubjects } from "@app/context";
import { withPermission } from "@app/hoc";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { createNotification } from "@app/components/notifications";
import { Button, FormControl, Input, Modal, ModalContent } from "@app/components/v2";
import { useCreateOrg, useSelectOrganization } from "@app/hooks/api";
import { useUser } from "@app/context";
import { useCreateSharedSecret } from "@app/hooks/api/organization/queries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClipboard } from "@fortawesome/free-solid-svg-icons";

const schema = z
  .object({
    secret: z.string().nonempty({ message: "Secret is required" }),
    duration: z.coerce
      .number()
      .int()
      .positive()
      .min(1, { message: "Duration should be at least 1" })
  })
  .required();

export type FormData = z.infer<typeof schema>;

const ShareSecrets = withPermission(
  () => {
    const {
      control,
      handleSubmit,
      reset,
      formState: { isSubmitting }
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        secret: "",
        duration: 1
      }
    });
    const { user } = useUser();
    const { mutateAsync: createSharedSecret } = useCreateSharedSecret();
    const [secretGenerated, setSecretGenerated] = useState(false);
    const [shareableUrl, setShareableUrl] = useState("");
    const [copiedUrl, setCopiedUrl] = useState(false);

    const onFormSubmit = async ({ secret, duration }: FormData) => {
      try {
        const expiration = new Date(new Date().getTime() + duration * 60000);
        const shareableSecretId = await createSharedSecret({
          userId: user.id,
          expiration: expiration.toISOString(),
          data: secret
        });
        const baseUrl =
          window.location.href.split("/")[0] + "//" + window.location.href.split("/")[2];
        setShareableUrl(`${baseUrl}/shared-secret/${shareableSecretId}`);
        setSecretGenerated(true);
      } catch (err) {
        console.log(err);
        createNotification({
          text: "Failed to create shareable secret.",
          type: "error"
        });
      }
    };

    const handleCopyPress = useCallback(() => {
      if (shareableUrl) {
        navigator.clipboard.writeText(shareableUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      }
    }, [shareableUrl, setCopiedUrl]);

    return (
      <>
        <Head>
          <title>Secret sharing</title>
          <link rel="icon" href="/infisical.ico" />
          <meta property="og:image" content="/images/message.png" />
        </Head>
        <div className="flex h-full w-full justify-center bg-bunker-800 text-white">
          <div className="w-full max-w-7xl px-6">
            {secretGenerated ? (
              <>
                <div className="m-auto mt-6 pb-5 text-3xl font-semibold text-gray-200 ">
                  Shareable Url:
                </div>
                <div className=" flex h-fit w-fit max-w-7xl flex-row bg-mineshaft-600 p-5 text-lg font-bold text-mineshaft-300 underline">
                  <a href={shareableUrl}>{shareableUrl}</a>

                  <button
                    type="button"
                    onClick={handleCopyPress}
                    className="my-auto h-full pl-5 pr-2 text-bunker-300 duration-200 hover:text-primary-200"
                  >
                    {copiedUrl ? (
                      <FontAwesomeIcon icon={faCheck} className="pr-0.5" />
                    ) : (
                      <FontAwesomeIcon icon={faClipboard} />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-6 text-3xl font-semibold text-gray-200">Secret Sharing</div>
                <div className="mb-6 text-lg text-mineshaft-300">
                  Generate shareable links to securely share secrets with configurable link duration
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)}>
                  <Controller
                    control={control}
                    defaultValue=""
                    name="secret"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        label="Secret"
                        isError={Boolean(error)}
                        errorText={error?.message}
                      >
                        <Input {...field} placeholder="Enter secret..." />
                      </FormControl>
                    )}
                  />
                  <Controller
                    control={control}
                    defaultValue={5}
                    name="duration"
                    render={({ field, fieldState: { error } }) => (
                      <FormControl
                        label="Duration (in minutes)"
                        isError={Boolean(error)}
                        errorText={error?.message}
                      >
                        <Input {...field} placeholder="Duration in minutes..." />
                      </FormControl>
                    )}
                  />
                  <div className="flex w-full gap-4">
                    <Button
                      className=""
                      size="sm"
                      type="submit"
                      isLoading={isSubmitting}
                      isDisabled={isSubmitting}
                    >
                      Generate Link
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </>
    );
  },
  {
    action: OrgPermissionActions.Read,
    subject: OrgPermissionSubjects.Workspace
  }
);

Object.assign(ShareSecrets, { requireAuth: true });

export default ShareSecrets;
