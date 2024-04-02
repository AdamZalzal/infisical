import { z } from "zod";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

export const registerSecretSharingRouter = async (server: FastifyZodProvider) => {
  server.route({
    url: "/",
    method: "POST",
    schema: {
      body: z.object({
        data: z.string(),
        userId: z.string(),
        expiration: z.string()
      }),
      response: {
        200: z.object({
          sharedSecretId: z.string()
        })
      }
    },

    handler: async (req) => {
      const {data, userId, expiration} = req.body
      const sharedSecretId = await server.services.secretSharing.createSharedSecret({
        data,
        userId,
        expiration
      })
      return { sharedSecretId: sharedSecretId }
    }
  });

  server.route({
    url: "/:sharedSecretId",
    method: "GET",
    schema: {
      params:z.object({
        sharedSecretId: z.string()
      }),

      response: {
        200: z.object({
          sharedSecret: z.string()
        })
      }
    },
    handler: async (req) => {
      const sharedSecret = await server.services.secretSharing.getSharedSecret({
        sharedSecretId: req.params.sharedSecretId
      })
      return { sharedSecret }
    }
  });
};
