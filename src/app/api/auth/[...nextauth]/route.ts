import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
          clientId: process.env.GITHUB_ID ?? '',
          clientSecret: process.env.GITHUB_SECRET ?? ''
        }),
        CredentialProvider({
          credentials: {
            email: {
              type: 'email'
            },
            password: {
              type: 'password'
            }
          },
          async authorize(credentials, req) {
            const user = {
              id: '1',
              name: 'John',
              email: credentials?.email as string
            };
            if (user) {
              // Any object returned will be saved in `user` property of the JWT
              return user;
            } else {
              // If you return null, an error will be shown advising the user to check their details
              return null;
            }
          }
        })
      ],
      pages: {
        signIn: '/' // custom sign-in page
      }
}
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export default handler