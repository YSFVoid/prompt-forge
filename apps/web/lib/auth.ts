import { MongoDBAdapter } from '@auth/mongodb-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { MongoClient } from 'mongodb';
import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';

const MONGODB_URI = process.env.MONGODB_URI || '';

let clientPromise: Promise<MongoClient>;

if (MONGODB_URI) {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
}

function getProviders() {
    const providers: NextAuthOptions['providers'] = [];

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        providers.push(
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            })
        );
    }

    if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM) {
        providers.push(
            EmailProvider({
                server: {
                    host: process.env.EMAIL_SERVER_HOST,
                    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
                    auth: {
                        user: process.env.EMAIL_SERVER_USER || '',
                        pass: process.env.EMAIL_SERVER_PASSWORD || '',
                    },
                },
                from: process.env.EMAIL_FROM,
            })
        );
    }

    return providers;
}

export const authOptions: NextAuthOptions = {
    adapter: (MONGODB_URI ? MongoDBAdapter(clientPromise!) : undefined) as Adapter,
    providers: getProviders(),
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/signin',
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
