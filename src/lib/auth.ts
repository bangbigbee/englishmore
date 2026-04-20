import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true
    }),
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@example.com' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatches = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatches) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || undefined
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  events: {
    createUser: async (message) => {
      try {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const toeicRef = cookieStore.get('toeic_ref')?.value
        if (toeicRef) {
          await prisma.user.update({
            where: { id: message.user.id },
            data: { toeicReferrerId: toeicRef }
          })
        }
      } catch (error) {
        // Suppress errors about cookies() outside of request context, though it should be safe here
      }
    }
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub
        // Fetch fresh user data from database to sync name and image
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { name: true, image: true, tier: true, tierExpiresAt: true }
        })
        if (dbUser) {
          session.user.name = dbUser.name
          session.user.image = dbUser.image
          session.user.tier = dbUser.tier
          session.user.tierExpiresAt = dbUser.tierExpiresAt ? dbUser.tierExpiresAt.toISOString() : null
        }
      }
      if (token.role) {
        session.user.role = token.role as string
      }
      if (token.tier !== undefined) {
        session.user.tier = token.tier as string
        session.user.tierExpiresAt = token.tierExpiresAt as string | null
      }
      return session
    },
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.sub = user.id
      }

      // Always refresh role from database to avoid stale role in JWT/session
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, tier: true, tierExpiresAt: true, enrollments: { select: { id: true }, take: 1 } }
        })
        if (dbUser) {
          let currentTier = dbUser.tier
          
          // Check expiration
          if (dbUser.tierExpiresAt && new Date() > dbUser.tierExpiresAt && currentTier !== 'FREE') {
            const hasCourse = dbUser.enrollments.length > 0
            currentTier = hasCourse ? 'PRO' : 'FREE'
            
            // Background update to DB
            prisma.user.update({
              where: { id: token.sub },
              data: { tier: currentTier, tierExpiresAt: null }
            }).catch(console.error)
          }

          token.role = dbUser.role
          token.tier = currentTier
          token.tierExpiresAt = dbUser.tierExpiresAt ? dbUser.tierExpiresAt.toISOString() : null
        }
      }

      return token
    },
    redirect: async ({ url, baseUrl }) => {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}